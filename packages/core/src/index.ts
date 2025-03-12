import type { Plugin } from 'vite'
import { normalizePath } from 'vite'
import { optimize } from 'svgo'
import type { HTMLElement } from 'node-html-parser'
import { parse } from 'node-html-parser'
import type { FileStats, InjectMode, Options, SvgoConfig } from './typing'
import fg from 'fast-glob'
import { createHash } from 'crypto'
import fs from 'fs-extra'
import path from 'pathe'
import Debug from 'debug'
import {
  ERR_CUSTOM_DOM_ID_SYNTAX,
  ERR_ICON_DIRS_REQUIRED,
  ERR_SYMBOL_ID_NO_NAME,
  ERR_SYMBOL_ID_SYNTAX,
  REGEXP_DOM_ID,
  REGEXP_SYMBOL_ID,
  SVG_DOM_ID,
  VIRTUAL_NAMES,
  VIRTUAL_NAMES_URL,
  VIRTUAL_REGISTER,
  VIRTUAL_REGISTER_URL,
  XMLNS,
  XMLNS_LINK,
} from './constants'

export * from './typing'

const debug = Debug.debug('vite-plugin-svg-icons-ng')

export function createSvgIconsPlugin(opt: Options): Plugin {
  validateOption(opt)

  const cache = new Map<string, FileStats>()

  let isBuild = false
  const options = {
    symbolId: 'icon-[dir]-[name]',
    svgoOptions: {},
    inject: 'body-last',
    customDomId: SVG_DOM_ID,
    ...opt,
  } as Required<Options>

  const { svgoOptions } = options
  const { symbolId } = options

  if (!symbolId.includes('[name]')) {
    throw new Error('SymbolId must contain [name] string!')
  }

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
    async load(id, ssr) {
      if (!isBuild && !ssr) return null

      const isVirtualRegister = id === '\0' + VIRTUAL_REGISTER
      const isVirtualNames = id === '\0' + VIRTUAL_NAMES

      if (ssr && !isBuild && (isVirtualRegister || isVirtualNames)) {
        return `export default {}`
      }
      const { code, idSet } = await createModuleCode(cache, svgoOptions, options)
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
          const { code, idSet } = await createModuleCode(cache, svgoOptions, options)
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

async function createModuleCode(cache: Map<string, FileStats>, svgoOptions: SvgoConfig, options: Required<Options>) {
  const { insertHtml, idSet } = await compilerIcons(cache, svgoOptions, options)

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
    ${domInject(options.inject)}
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

function domInject(inject: InjectMode = 'body-last') {
  switch (inject) {
    case 'body-first':
      return 'body.insertBefore(el, body.firstChild);'
    default:
      return 'body.insertBefore(el, body.lastChild);'
  }
}

/**
 * Preload all icons in advance
 * @param cache
 * @param svgOptions
 * @param options
 */
async function compilerIcons(cache: Map<string, FileStats>, svgOptions: SvgoConfig, options: Required<Options>) {
  const { iconDirs } = options

  let insertHtml = ''
  const idSet = new Set<string>()

  for (const dir of iconDirs) {
    const svgFilsStats = fg.sync('**/*.svg', {
      cwd: dir,
      stats: true,
      absolute: true,
    })

    for (const entry of svgFilsStats) {
      const { path, stats: { mtimeMs } = {} } = entry
      const cacheStat = cache.get(path)
      let svgSymbol
      let symbolId
      let relativeName = ''

      const getSymbol = async () => {
        relativeName = normalizePath(path).replace(normalizePath(dir + '/'), '')
        symbolId = generateSymbolId(relativeName, options)
        svgSymbol = await compilerIcon(path, symbolId, svgOptions)
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

async function compilerIcon(file: string, symbolId: string, svgOptions: SvgoConfig): Promise<string | null> {
  if (!file) {
    return null
  }

  let content = fs.readFileSync(file, 'utf-8')

  if (svgOptions) {
    try {
      content = optimize(content, svgOptions).data || content
    } catch (error) {
      console.warn(`[vite-plugin-svg-icons-ng]: Error optimizing SVG file, skip it (${file}), caused by:\n${error}`)
    }
  }

  // fix cannot change svg color  by  parent node problem
  content = content.replace(/stroke="[a-zA-Z#0-9]*"/, 'stroke="currentColor"')
  return convertSvgToSymbol(symbolId, content)
}

/**
 * transform <svg> to <symbol>
 * @param id symbolId
 * @param content svg content
 * @returns transformed symbol content
 */
function convertSvgToSymbol(id: string, content: string) {
  // parse svg
  const root = parse(content)
  const svg = root.querySelector('svg')
  if (!svg) {
    throw new Error('Invalid SVG content, missing <svg> element.')
  }
  // remove useless attrs
  removeUselessAttrs(svg)
  // unify size to viewBox
  unifySizeToViewBox(svg)
  // prefix internal id
  prefixInternalId(svg, id)
  svg.tagName = 'symbol'
  svg.setAttribute('id', id)
  return svg.toString()
}

function removeUselessAttrs(svg: HTMLElement) {
  svg.removeAttribute('xmlns')
  svg.removeAttribute('xmlns:xlink')
  svg.removeAttribute('class')
  svg.removeAttribute('style')
  svg.removeAttribute('role')
  svg.removeAttribute('aria-hidden')
}

function unifySizeToViewBox(svg: HTMLElement) {
  const { viewBox, width, height } = svg.attributes
  if (!viewBox && width && height) {
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  }
  svg.removeAttribute('width')
  svg.removeAttribute('height')
}

function prefixInternalId(svg: HTMLElement, id: string) {
  // reflect oldId -> newId
  const idMap = new Map()
  // rename defs id
  for (const defs of svg.querySelectorAll('defs')) {
    for (const child of defs.children) {
      const oldId = child.getAttribute('id')
      if (oldId) {
        const newId = `${id}_${oldId}`
        child.setAttribute('id', newId)
        idMap.set(oldId, newId)
        // remove units attrs, it will cause error
        child.removeAttribute('maskUnits')
        child.removeAttribute('patternUnits')
        child.removeAttribute('gradientUnits')
        child.removeAttribute('clipPathUnits')
        child.removeAttribute('markerUnits')
        child.removeAttribute('filterUnits')
      }
    }
  }
  // replace id reference
  if (idMap.size > 0) {
    for (const el of svg.querySelectorAll('*')) {
      for (const [attrName, attrValue] of Object.entries(el.attributes)) {
        // xlink:href || href reference, example:`<use xlink:href="#xxx">`
        if ((attrName === 'xlink:href' || attrName === 'href') && attrValue.startsWith('#')) {
          const refId = attrValue.slice(1)
          if (idMap.has(refId)) {
            el.setAttribute('xlink:href', `#${idMap.get(refId)}`)
            el.setAttribute('href', `#${idMap.get(refId)}`)
          }
        }
        // url(#xxx) reference, example: mask、clip-path
        if (attrValue.indexOf('url(#') !== -1) {
          const newValue = attrValue.replace(/url\(#(.*?)\)/g, (match, refId) => {
            if (idMap.has(refId)) {
              return `url(#${idMap.get(refId)})`
            }
            return match
          })
          el.setAttribute(attrName, newValue)
        }
      }
    }
  }
}

function generateSymbolId(name: string, options: Required<Options>) {
  const { symbolId = 'icon-[dir]-[name]' } = options

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

function validateOption(opt: Options) {
  // iconDirs is required
  if (!opt.iconDirs || opt.iconDirs.length === 0) {
    throw new Error(ERR_ICON_DIRS_REQUIRED)
  }
  if (opt.symbolId) {
    // symbolId must contain [name]
    if (!opt.symbolId.includes('[name]')) {
      throw new Error(ERR_SYMBOL_ID_NO_NAME)
    } else {
      // symbolId must be a valid ASCII letter, number, underline, hyphen, and starting with a letter, then cannot contain consecutive hyphens
      const clearSymbolId = opt.symbolId.replaceAll(/\[name]/g, '').replaceAll(/\[dir]/g, '')
      if (!REGEXP_SYMBOL_ID.test(clearSymbolId)) {
        throw new Error(ERR_SYMBOL_ID_SYNTAX)
      }
    }
  }
  // customDomId must be a valid ASCII letter, number, underline, hyphen, and starting with a letter or underline
  if (opt.customDomId && !REGEXP_DOM_ID.test(opt.customDomId)) {
    throw new Error(ERR_CUSTOM_DOM_ID_SYNTAX)
  }
}

export const __TEST__ = {
  generateSymbolId,
  parseDirName,
  validateOption,
}
