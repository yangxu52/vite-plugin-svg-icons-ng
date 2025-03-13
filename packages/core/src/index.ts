import type { Plugin } from 'vite'
import { normalizePath } from 'vite'
import { optimize } from 'svgo'
import type { CacheEntry, Options, SymbolEntry } from './typing'
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

  const cache = new Map<string, CacheEntry>()

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
      const { sprite, ids } = await createModuleCode(cache, options)
      if (isVirtualRegister) {
        return sprite
      }
      if (isVirtualNames) {
        return ids
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
          const { sprite, ids } = await createModuleCode(cache, options)
          const content = url.endsWith(VIRTUAL_REGISTER_URL) ? sprite : ids
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

async function createModuleCode(cache: Map<string, CacheEntry>, options: Required<Options>) {
  const list = await compilerIcons(cache, options)
  const ids = list.map((item) => item.symbolId)
  const symbols = list.map((item) => item.symbol).join('')
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
    el.innerHTML = ${JSON.stringify(symbols)};
    ${options.inject === 'body-last' ? 'body.insertBefore(el, body.firstChild);' : 'body.insertBefore(el, body.lastChild);'}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
}`
  return {
    sprite: `${code}\nexport default {}`,
    ids: `export default ${JSON.stringify(ids)}`,
  }
}

async function compilerIcons(cache: Map<string, CacheEntry>, options: Required<Options>) {
  const result: Array<SymbolEntry> = []
  for (const dir of options.iconDirs) {
    const entryList = fg.sync('**/*.svg', { cwd: dir, stats: true, absolute: true })
    for (const entry of entryList) {
      const { path, stats: { mtimeMs } = {} } = entry
      const cached = cache.get(path)
      if (cached && cached.mtimeMs === mtimeMs) {
        result.push(cached.entry)
      } else {
        const relativePath = normalizePath(path).replace(normalizePath(dir + '/'), '') || ''
        const symbolId = generateSymbolId(relativePath, options)
        const symbol = await processIcon(path, symbolId, options)
        cache.set(path, { mtimeMs, entry: { symbolId, symbol } })
        result.push({ symbolId, symbol })
      }
    }
  }
  return result
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

function generateSymbolId(relativePath: string, options: Required<Options>) {
  const { symbolId } = options
  const { dirName, baseName } = parseDirName(relativePath)
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
