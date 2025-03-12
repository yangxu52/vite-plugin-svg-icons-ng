import type { Plugin } from 'vite'
import { normalizePath } from 'vite'
import { optimize } from 'svgo'
import type { FileStats, Options } from './typing'
import fg from 'fast-glob'
import { createHash } from 'crypto'
import fs from 'fs-extra'
import path from 'pathe'
import Debug from 'debug'
import { ERR_SVGO_EXCEPTION, SVG_DOM_ID, VIRTUAL_NAMES, VIRTUAL_NAMES_URL, VIRTUAL_REGISTER, VIRTUAL_REGISTER_URL, XMLNS, XMLNS_LINK } from './constants'
import { convertSvgToSymbol } from './convert'
import { validate } from './validate'

export * from './typing'

const debug = Debug.debug('vite-plugin-svg-icons-ng')

function createSvgIconsPlugin(opt: Options): Plugin {
  validate(opt)

  const cache = new Map<string, FileStats>()

  let isBuild = false
  const options = {
    symbolId: 'icon-[dir]-[name]',
    svgoOptions: {},
    inject: 'body-last',
    customDomId: SVG_DOM_ID,
    ...opt,
  } as Required<Options>

  debug('plugin options:', options)

  return {
    name: 'vite:svg-icons',
    configResolved(resolvedConfig) {
      isBuild = resolvedConfig.command === 'build'
      debug('resolvedConfig:', resolvedConfig)
    },
    resolveId(id) {
      return [VIRTUAL_REGISTER, VIRTUAL_NAMES].includes(id) ? '\0' + id : undefined
    },
    load: async (id, ssr) => {
      if (!isBuild && !ssr) return null

      const isVirtualRegister = id === '\0' + VIRTUAL_REGISTER
      const isVirtualNames = id === '\0' + VIRTUAL_NAMES

      if (ssr && !isBuild && (isVirtualRegister || isVirtualNames)) {
        return `export default {}`
      }
      const { code, idSet } = await createModuleCode(cache, options)
      if (isVirtualRegister) {
        return code
      }
      if (isVirtualNames) {
        return idSet
      }
    },
    configureServer: ({ middlewares }) => {
      //TODO: use the use(route, handle) replacement
      middlewares.use(async (req, res, next) => {
        const url = normalizePath(req.url!)
        if (url.endsWith(VIRTUAL_REGISTER_URL) || url.endsWith(VIRTUAL_NAMES_URL)) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'no-cache')
          const { code, idSet } = await createModuleCode(cache, options)
          const content = url.endsWith(VIRTUAL_REGISTER_URL) ? code : idSet
          res.setHeader('Etag', getWeakETag(content))
          res.statusCode = 200
          res.end(content)
        } else {
          next()
        }
      })
    },
  }
}

async function createModuleCode(cache: Map<string, FileStats>, options: Required<Options>) {
  const { insertHtml, idSet } = await compilerIcons(cache, options)

  const code = `if (typeof window !== 'undefined') {
  function load() {
    var body = document.body;
    var el = document.getElementById('${options.customDomId}');
    if (!el) {
      el = document.createElementNS('${XMLNS}', 'svg');
      el.style.position = 'absolute';
      el.style.width = '0';
      el.style.height = '0';
      el.id = '${options.customDomId}';
      el.setAttribute('xmlns', '${XMLNS}');
      el.setAttribute('xmlns:link', '${XMLNS_LINK}');
      el.setAttribute('aria-hidden', true);
    }
    el.innerHTML = ${JSON.stringify(insertHtml)};
    ${options.inject === 'body-last' ? 'body.insertBefore(el, body.firstChild);' : 'body.insertBefore(el, body.lastChild);'}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
}`
  return {
    code: `${code}\nexport default {}`,
    idSet: `export default ${JSON.stringify(Array.from(idSet))}`,
  }
}

async function compilerIcons(cache: Map<string, FileStats>, options: Required<Options>) {
  let insertHtml = ''
  const idSet = new Set<string>()

  for (const dir of options.iconDirs) {
    const entryList = fg.sync('**/*.svg', { cwd: dir, stats: true, absolute: true })

    for (const entry of entryList) {
      const { path, stats: { mtimeMs } = {} } = entry
      const cacheStat = cache.get(path)
      let svgSymbol
      let symbolId
      let relativeName = ''

      const getSymbol = async () => {
        relativeName = normalizePath(path).replace(normalizePath(dir + '/'), '')
        symbolId = generateSymbolId(relativeName, options)
        svgSymbol = await processIcon(path, symbolId, options)
        idSet.add(symbolId)
      }

      if (cacheStat) {
        if (cacheStat.mtimeMs !== mtimeMs) {
          await getSymbol()
        } else {
          svgSymbol = cacheStat.code
          symbolId = cacheStat.symbolId
          if (symbolId) idSet.add(symbolId)
        }
      } else {
        await getSymbol()
      }

      if (symbolId)
        cache.set(path, {
          mtimeMs,
          relativeName,
          code: svgSymbol,
          symbolId,
        })
      insertHtml += `${svgSymbol || ''}`
    }
  }
  return { insertHtml, idSet }
}

async function processIcon(file: string, symbolId: string, options: Required<Options>): Promise<string> {
  let content = await fs.promises.readFile(file, 'utf-8')
  if (options.svgoOptions) {
    try {
      content = optimize(content, options.svgoOptions).data
    } catch (error) {
      console.warn(ERR_SVGO_EXCEPTION(file, error))
    }
  }
  // fix cannot change svg color  by  parent node problem
  content = content.replace(/stroke="[a-zA-Z#0-9]*"/, 'stroke="currentColor"')
  return convertSvgToSymbol(symbolId, content)
}

function generateSymbolId(name: string, options: Required<Options>) {
  const { symbolId } = options

  const { dirName, baseName } = parseDirName(name)

  const id = symbolId.replace(/\[dir]/g, dirName).replace(/\[name]/g, baseName)

  return id.replace(/-+/g, '-').replace(/(^-|-$)/g, '')
}

function parseDirName(name: string) {
  let dirName = ''
  let baseName = name
  const lastSeparators = name.lastIndexOf('/')
  if (lastSeparators !== -1) {
    dirName = name.slice(0, lastSeparators).split('/').filter(Boolean).join('-')
    baseName = name.slice(lastSeparators + 1)
  }
  return {
    dirName,
    baseName: path.basename(baseName, path.extname(baseName)),
  }
}

function getWeakETag(str: string) {
  return str.length === 0
    ? '"W/0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"'
    : `W/${Buffer.byteLength(str, 'utf8')}-${createHash('sha1').update(str, 'utf8').digest('base64').substring(0, 27)}`
}

const __TEST__ = { generateSymbolId, parseDirName, validate }
export { __TEST__, createSvgIconsPlugin }
