import type { Plugin } from 'vite'
import { normalizePath } from 'vite'
import type { Options, ResolvedOptions, SymbolCache, SymbolData } from './types'
import type { Entry } from 'fast-glob'
import fg from 'fast-glob'
import fs from 'fs-extra'
import { bakeIcon } from 'svg-icon-baker'
import {
  IDS_TEMPLATE,
  SPRITE_TEMPLATE,
  VIRTUAL_IDS,
  VIRTUAL_IDS_URL,
  VIRTUAL_NAMES_DEPRECATED,
  VIRTUAL_NAMES_URL_DEPRECATED,
  VIRTUAL_REGISTER,
  VIRTUAL_REGISTER_DEPRECATED,
  VIRTUAL_REGISTER_URL,
  VIRTUAL_REGISTER_URL_DEPRECATED,
} from './constants'
import { generateSymbolId, getWeakETag, resolveOptions, validateOptions } from './utils'

export function createSvgIconsPlugin(userOptions: Options): Plugin {
  validateOptions(userOptions)
  const options = resolveOptions(userOptions)
  let isBuild = false
  const cache = new Map<string, SymbolCache>()
  return {
    name: 'vite:svg-icons',
    configResolved(resolvedConfig) {
      isBuild = resolvedConfig.command === 'build'
    },
    resolveId(id) {
      return [VIRTUAL_REGISTER_DEPRECATED, VIRTUAL_NAMES_DEPRECATED, VIRTUAL_REGISTER, VIRTUAL_IDS].includes(id) ? '\0' + id : null
    },
    load: async (id, ssr) => {
      if (!isBuild && !ssr) return null

      const isVirtualRegister = id === '\0' + VIRTUAL_REGISTER_DEPRECATED || id === '\0' + VIRTUAL_REGISTER
      const isVirtualNames = id === '\0' + VIRTUAL_NAMES_DEPRECATED || id === '\0' + VIRTUAL_IDS

      if (ssr && !isBuild && (isVirtualRegister || isVirtualNames)) {
        return `export default {}`
      }
      if (isVirtualRegister) {
        return await createSpriteModule(cache, options)
      }
      if (isVirtualNames) {
        return await createIdsModule(cache, options)
      }
    },
    configureServer: ({ middlewares }) => {
      //TODO: use the use(route, handle) replacement
      middlewares.use(async (req, res, next) => {
        const url = normalizePath(req.url!)
        if (
          url.endsWith(VIRTUAL_REGISTER_URL_DEPRECATED) ||
          url.endsWith(VIRTUAL_NAMES_URL_DEPRECATED) ||
          url.endsWith(VIRTUAL_REGISTER_URL) ||
          url.endsWith(VIRTUAL_IDS_URL)
        ) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'no-cache')
          let content = ''
          if (url.endsWith(VIRTUAL_REGISTER_URL_DEPRECATED) || url.endsWith(VIRTUAL_REGISTER_URL)) {
            content = await createSpriteModule(cache, options)
          }
          if (url.endsWith(VIRTUAL_NAMES_URL_DEPRECATED) || url.endsWith(VIRTUAL_IDS_URL)) {
            content = await createIdsModule(cache, options)
          }
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

async function createIdsModule(cache: Map<string, SymbolCache>, options: ResolvedOptions) {
  const list = await compilerIcons(cache, options)
  return IDS_TEMPLATE(JSON.stringify(list.map((i) => i.id)))
}

async function createSpriteModule(cache: Map<string, SymbolCache>, options: ResolvedOptions) {
  const list = await compilerIcons(cache, options)
  return SPRITE_TEMPLATE(JSON.stringify(list.map((i) => i.content).join('')), options.customDomId, options.inject)
}

async function compilerIcons(cache: Map<string, SymbolCache>, options: ResolvedOptions) {
  const dirPromises = options.iconDirs.map(async (dir) => {
    const entryList = await fg.glob('**/*.svg', { cwd: dir, stats: true, absolute: true })
    const entryPromises = entryList.map(async (e) => {
      return await process(e, cache, dir, options)
    })
    return (await Promise.all(entryPromises)).filter(Boolean) as SymbolData[]
  })
  return (await Promise.all(dirPromises)).flat()
}

async function process(e: Entry, cache: Map<string, SymbolCache>, dir: string, options: ResolvedOptions) {
  const { path, stats: { mtimeMs } = {} } = e
  const cached = cache.get(path)
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.symbol
  }
  try {
    const relativePath = normalizePath(path).replace(normalizePath(dir + '/'), '') || ''
    const id = generateSymbolId(relativePath, options)
    const content = await processIcon(path, id, options)
    const symbol = { id, content }
    cache.set(path, { mtimeMs, symbol })
    return symbol
  } catch {
    return null
  }
}

async function processIcon(file: string, symbolId: string, options: ResolvedOptions): Promise<string> {
  const svg = await fs.promises.readFile(file, 'utf-8')
  try {
    const { content } = bakeIcon({ name: symbolId, content: svg }, options.optimize)
    return overrideStroke(content, options)
  } catch (error) {
    throw new Error(`Failed on icon ${file}, ${String(error)}`)
  }
}

function overrideStroke(symbol: string, options: ResolvedOptions): string {
  if (options.strokeOverride === false) {
    return symbol
  } else {
    return symbol.replace(/\bstroke="[^"]*"/gi, `stroke="${options.strokeOverride}"`)
  }
}
