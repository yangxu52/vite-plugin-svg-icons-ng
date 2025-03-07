import type { Plugin } from 'vite'
import { normalizePath } from 'vite'
import { optimize } from 'svgo'
import { parse } from 'node-html-parser'
import type { FileStats, InjectMode, Options, SvgoConfig } from './typing'
import fg from 'fast-glob'
import getEtag from 'etag'
import cors from 'cors'
import fs from 'fs-extra'
import path from 'pathe'
import Debug from 'debug'
import { SVG_DOM_ID, SVG_ICONS_CLIENT, SVG_ICONS_REGISTER_NAME, XMLNS, XMLNS_LINK } from './constants'

export * from './typing'

const debug = Debug.debug('vite-plugin-svg-icons-ng')

export function createSvgIconsPlugin(opt: Options): Plugin {
  const cache = new Map<string, FileStats>()

  let isBuild = false
  const options = {
    svgoOptions: {},
    symbolId: 'icon-[dir]-[name]',
    inject: 'body-last' as const,
    customDomId: SVG_DOM_ID,
    ...opt,
  }

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
      if ([SVG_ICONS_REGISTER_NAME, SVG_ICONS_CLIENT].includes(id)) {
        return id
      }
    },
    async load(id, ssr) {
      if (!isBuild && !ssr) return null

      const isRegister = id.endsWith(SVG_ICONS_REGISTER_NAME)
      const isClient = id.endsWith(SVG_ICONS_CLIENT)

      if (ssr && !isBuild && (isRegister || isClient)) {
        return `export default {}`
      }

      const { code, idSet } = await createModuleCode(cache, svgoOptions, options)
      if (isRegister) {
        return code
      }
      if (isClient) {
        return idSet
      }
    },
    configureServer: ({ middlewares }) => {
      middlewares.use(cors({ origin: '*' }))
      middlewares.use(async (req, res, next) => {
        const url = normalizePath(req.url!)

        const registerId = `/@id/${SVG_ICONS_REGISTER_NAME}`
        const clientId = `/@id/${SVG_ICONS_CLIENT}`
        if ([clientId, registerId].some((item) => url.endsWith(item))) {
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'no-cache')
          const { code, idSet } = await createModuleCode(cache, svgoOptions, options)
          const content = url.endsWith(registerId) ? code : idSet

          res.setHeader('Etag', getEtag(content, { weak: true }))
          res.statusCode = 200
          res.end(content)
        } else {
          next()
        }
      })
    },
  }
}

export async function createModuleCode(cache: Map<string, FileStats>, svgoOptions: SvgoConfig, options: Options) {
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
export async function compilerIcons(cache: Map<string, FileStats>, svgOptions: SvgoConfig, options: Options) {
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
        symbolId = createSymbolId(relativeName, options)
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

export async function compilerIcon(file: string, symbolId: string, svgOptions: SvgoConfig): Promise<string | null> {
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
  // if no viewBox, use width and height
  let viewBox = svg.getAttribute('viewBox')
  const width = svg.getAttribute('width')
  const height = svg.getAttribute('height')
  if (!viewBox && width && height) {
    viewBox = `0 0 ${width} ${height}`
    svg.removeAttribute('width')
    svg.removeAttribute('height')
  }
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
  return `<symbol id="${id}" viewBox="${viewBox}">${svg.innerHTML}</symbol>`
}

export function createSymbolId(name: string, options: Options) {
  const { symbolId } = options

  if (!symbolId) {
    return name
  }

  let id = symbolId
  let fName = name

  const { fileName = '', dirName } = discreteDir(name)
  if (symbolId.includes('[dir]')) {
    id = id.replace(/\[dir\]/g, dirName)
    if (!dirName) {
      id = id.replace('--', '-')
    }
    fName = fileName
  }
  id = id.replace(/\[name\]/g, fName)
  return id.replace(path.extname(id), '')
}

export function discreteDir(name: string) {
  if (!normalizePath(name).includes('/')) {
    return {
      fileName: name,
      dirName: '',
    }
  }
  const strList = name.split('/')
  const fileName = strList.pop()
  const dirName = strList.join('-')
  return { fileName, dirName }
}
