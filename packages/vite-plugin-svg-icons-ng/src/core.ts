import type { Plugin } from 'vite'
import { normalizePath } from 'vite'
import type { CacheEntry, Options, SymbolEntry } from './types'
import type { Entry } from 'fast-glob'
import fg from 'fast-glob'
import fs from 'fs-extra'
import { bakeIcon } from 'svg-icon-baker'
import {
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
import { generateSymbolId, getWeakETag, mergeOptions, validateOptions } from './utils'

export function createSvgIconsPlugin(userOptions: Options): Plugin {
  validateOptions(userOptions)
  const options = mergeOptions(userOptions)
  let isBuild = false
  const cache = new Map<string, CacheEntry>()
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

async function createIdsModule(cache: Map<string, CacheEntry>, options: Required<Options>) {
  const list = await compilerIcons(cache, options)
  return `export default ${JSON.stringify(list.map((i) => i.symbolId))}`
}

async function createSpriteModule(cache: Map<string, CacheEntry>, options: Required<Options>) {
  const list = await compilerIcons(cache, options)
  return SPRITE_TEMPLATE(list.map((i) => i.symbol).join(''), options.customDomId, options.inject)
}

async function compilerIcons(cache: Map<string, CacheEntry>, options: Required<Options>) {
  const dirPromises = options.iconDirs.map(async (dir) => {
    const entryList = await fg.glob('**/*.svg', { cwd: dir, stats: true, absolute: true })
    const entryPromises = entryList.map(async (e) => {
      return await process(e, cache, dir, options)
    })
    return (await Promise.all(entryPromises)).filter(Boolean) as SymbolEntry[]
  })
  return (await Promise.all(dirPromises)).flat()
}

async function process(e: Entry, cache: Map<string, CacheEntry>, dir: string, options: Required<Options>) {
  const { path, stats: { mtimeMs } = {} } = e
  const cached = cache.get(path)
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.entry
  }
  try {
    const relativePath = normalizePath(path).replace(normalizePath(dir + '/'), '') || ''
    const symbolId = generateSymbolId(relativePath, options)
    let symbol = await processIcon(path, symbolId)
    symbol = overrideStroke(symbol, options)
    const entry = { symbolId, symbol }
    cache.set(path, { mtimeMs, entry })
    return entry
  } catch {
    return null
  }
}

async function processIcon(file: string, symbolId: string): Promise<string> {
  const svg = await fs.promises.readFile(file, 'utf-8')
  try {
    const { symbol } = bakeIcon({ name: symbolId, content: svg })
    return symbol
  } catch (error) {
    throw new Error(`Failed on icon ${file}, ${String(error)}`)
  }
}

function overrideStroke(symbol: string, options: Required<Options>): string {
  if (options.strokeOverride === true) {
    symbol = symbol.replace(/\bstroke="[^"]*"/gi, 'stroke="currentColor"')
  } else if (options.strokeOverride !== null && typeof options.strokeOverride === 'object' && options.strokeOverride.color) {
    symbol = symbol.replace(/\bstroke="[^"]*"/gi, `stroke="${options.strokeOverride.color}"`)
  }
  return symbol
}
