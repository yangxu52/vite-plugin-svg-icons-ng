import type { Plugin } from 'vite'
import { normalizePath } from 'vite'
import { optimize } from 'svgo'
import type { CacheEntry, Options, SymbolEntry } from './typing'
import fg from 'fast-glob'
import { createHash } from 'crypto'
import fs from 'fs-extra'
import path from 'pathe'
import { ERR_SVGO_EXCEPTION, SPRITE_TEMPLATE, SVG_DOM_ID, VIRTUAL_NAMES, VIRTUAL_NAMES_URL, VIRTUAL_REGISTER, VIRTUAL_REGISTER_URL } from './constants'
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
      return [VIRTUAL_REGISTER, VIRTUAL_NAMES].includes(id) ? '\0' + id : null
    },
    load: async (id, ssr) => {
      if (!isBuild && !ssr) return null

      const isVirtualRegister = id === '\0' + VIRTUAL_REGISTER
      const isVirtualNames = id === '\0' + VIRTUAL_NAMES

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
        if (url.endsWith(VIRTUAL_REGISTER_URL) || url.endsWith(VIRTUAL_NAMES_URL)) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'no-cache')
          let content = ''
          if (url.endsWith(VIRTUAL_REGISTER_URL)) {
            content = await createSpriteModule(cache, options)
          }
          if (url.endsWith(VIRTUAL_NAMES_URL)) {
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
  let svg = await fs.promises.readFile(file, 'utf-8')
  if (options.svgoOptions) {
    try {
      svg = optimize(svg, options.svgoOptions).data
    } catch (error) {
      console.warn(ERR_SVGO_EXCEPTION(file, error))
    }
  }
  // fix cannot change svg color  by  parent node problem
  svg = svg.replace(/stroke="[a-zA-Z#0-9]*"/, 'stroke="currentColor"')
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
    ...userOptions,
  }
}

const __TEST__ = { generateSymbolId, parseDirName, validate }
export { __TEST__, createSvgIconsPlugin }
