import type { Plugin } from 'vite'
import { normalizePath } from 'vite'
import type { Config } from 'svgo'
import { optimize } from 'svgo'
import type { HTMLElement } from 'node-html-parser'
import { parse } from 'node-html-parser'
import type { DomInject, FileStats, ViteSvgIconsPlugin } from './typing'
import fg from 'fast-glob'
import getEtag from 'etag'
import cors from 'cors'
import fs from 'fs-extra'
import path from 'pathe'
import Debug from 'debug'
import { SVG_DOM_ID, SVG_ICONS_CLIENT, SVG_ICONS_REGISTER_NAME, XMLNS, XMLNS_LINK } from './constants'

export * from './typing'

const debug = Debug.debug('vite-plugin-svg-icons')

export function createSvgIconsPlugin(opt: ViteSvgIconsPlugin): Plugin {
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
      return null
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

export async function createModuleCode(cache: Map<string, FileStats>, svgoOptions: Config, options: ViteSvgIconsPlugin) {
  const { insertHtml, idSet } = await compilerIcons(cache, svgoOptions, options)

  const code = `
       if (typeof window !== 'undefined') {
         function loadSvg() {
           var body = document.body;
           var svgDom = document.getElementById('${options.customDomId}');
           if(!svgDom) {
             svgDom = document.createElementNS('${XMLNS}', 'svg');
             svgDom.style.position = 'absolute';
             svgDom.style.width = '0';
             svgDom.style.height = '0';
             svgDom.id = '${options.customDomId}';
             svgDom.setAttribute('xmlns','${XMLNS}');
             svgDom.setAttribute('xmlns:link','${XMLNS_LINK}');
             svgDom.setAttribute('aria-hidden',true);
           }
           svgDom.innerHTML = ${JSON.stringify(insertHtml)};
           ${domInject(options.inject)}
         }
         if(document.readyState === 'loading') {
           document.addEventListener('DOMContentLoaded', loadSvg);
         } else {
           loadSvg()
         }
      }
        `
  return {
    code: `${code}\nexport default {}`,
    idSet: `export default ${JSON.stringify(Array.from(idSet))}`,
  }
}

function domInject(inject: DomInject = 'body-last') {
  switch (inject) {
    case 'body-first':
      return 'body.insertBefore(svgDom, body.firstChild);'
    default:
      return 'body.insertBefore(svgDom, body.lastChild);'
  }
}

/**
 * Preload all icons in advance
 * @param cache
 * @param svgOptions
 * @param options
 */
export async function compilerIcons(cache: Map<string, FileStats>, svgOptions: Config, options: ViteSvgIconsPlugin) {
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

export async function compilerIcon(file: string, symbolId: string, svgOptions: Config): Promise<string | null> {
  if (!file) {
    return null
  }

  let content = fs.readFileSync(file, 'utf-8')

  if (svgOptions) {
    const { data } = optimize(content, svgOptions)
    content = data || content
  }

  // fix cannot change svg color  by  parent node problem
  content = content.replace(/stroke="[a-zA-Z#0-9]*"/, 'stroke="currentColor"')
  return convertSvgToSymbol(symbolId, content)
}
/**
 * transform SVG to symbol
 * @param id symbolId
 * @param content SVG content
 * @returns modified symbol content
 */
function convertSvgToSymbol(id: string, content: string): string {
  const root = parse(content)
  const svgElement = root.querySelector('svg') as HTMLElement
  if (!svgElement) {
    throw new Error('Invalid SVG content')
  }
  // viewBox
  let viewBox = svgElement.getAttribute('viewBox')
  const width = svgElement.getAttribute('width')
  const height = svgElement.getAttribute('height')
  if (!viewBox && width && height) {
    const width = svgElement.getAttribute('width')
    const height = svgElement.getAttribute('height')
    viewBox = `0 0 ${width} ${height}`
    svgElement.removeAttribute('width')
    svgElement.removeAttribute('height')
  }
  // symbol id
  svgElement.querySelectorAll('[id]').forEach((el) => {
    const originalId = el.getAttribute('id')
    if (originalId) {
      const newId = `${id}_${originalId}`
      el.setAttribute('id', newId) // 添加前缀
      // use
      svgElement.querySelectorAll('use').forEach((useEl) => {
        // xlink:href||href
        const hrefAttr = useEl.getAttribute('xlink:href') || useEl.getAttribute('href')
        if (hrefAttr === `#${originalId}`) {
          useEl.setAttribute('xlink:href', `#${newId}`)
          useEl.setAttribute('href', `#${newId}`)
        }
        // filter
        const filterAttr = useEl.getAttribute('filter')
        if (filterAttr === `url(#${originalId})`) {
          useEl.setAttribute('filter', `url(#${newId})`)
        }
      })
    }
  })
  return `<symbol id="${id}" viewBox="${viewBox}">${svgElement.innerHTML}</symbol>`
}

export function createSymbolId(name: string, options: ViteSvgIconsPlugin) {
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
