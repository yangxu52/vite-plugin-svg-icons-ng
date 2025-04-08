import type { Plugin } from 'vite'
import { normalizePath } from 'vite'
import { optimize } from 'svgo'
import type { CacheEntry, Options, SymbolEntry } from './typing'
import type { Entry } from 'fast-glob'
import fg from 'fast-glob'
import { createHash } from 'crypto'
import fs from 'fs-extra'
import path from 'pathe'
import {
  ERR_SVGO_EXCEPTION,
  SPRITE_TEMPLATE,
  SVG_DOM_ID,
  VIRTUAL_IDS,
  VIRTUAL_IDS_URL,
  VIRTUAL_NAMES_DEPRECATED,
  VIRTUAL_NAMES_URL_DEPRECATED,
  VIRTUAL_REGISTER,
  VIRTUAL_REGISTER_DEPRECATED,
  VIRTUAL_REGISTER_URL,
  VIRTUAL_REGISTER_URL_DEPRECATED,
} from './constants'
import { convertSvgToSymbol } from './convert'
import { validate } from './validate'

export * from './typing'

function createSvgIconsPlugin(userOptions: Options): Plugin {
  validate(userOptions)
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
    const symbol = await processIcon(path, symbolId, options)
    const entry = { symbolId, symbol }
    cache.set(path, { mtimeMs, entry })
    return entry
  } catch {
    return null
  }
}

async function processIcon(file: string, symbolId: string, options: Required<Options>): Promise<string> {
  let svg = await fs.promises.readFile(file, 'utf-8')
  // svgo optimize
  if (options.svgoOptions) {
    try {
      svg = optimize(svg, options.svgoOptions).data
    } catch (error) {
      console.warn(ERR_SVGO_EXCEPTION(file, error))
    }
  }
  // stoke override
  if (options.strokeOverride === true) {
    svg = svg.replace(/\bstroke="[^"]*"/gi, 'stroke="currentColor"')
  } else if (options.strokeOverride !== null && typeof options.strokeOverride === 'object' && options.strokeOverride.color) {
    svg = svg.replace(/\bstroke="[^"]*"/gi, `stroke="${options.strokeOverride.color}"`)
  }
  return convertSvgToSymbol(symbolId, svg)
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

function mergeOptions(userOptions: Options): Required<Options> {
  return {
    symbolId: 'icon-[dir]-[name]',
    svgoOptions: {},
    inject: 'body-last',
    customDomId: SVG_DOM_ID,
    strokeOverride: false,
    ...userOptions,
  }
}

const __TEST__ = { generateSymbolId, parseDirName, validate }
export { __TEST__, createSvgIconsPlugin }
