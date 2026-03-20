import type { Plugin } from 'vite'
import { normalizePath } from 'vite'
import type { Options, PluginContext } from './types'
import { getWeakETag, resolveOptions, validateOptions } from './utils'
import { createMemoryCache } from './cache/memoryCache'
import { renderVirtualModule, resolveVirtualTypeFromId, resolveVirtualTypeFromUrl } from './plugin/virtual'

export function createSvgIconsPlugin(userOptions: Options): Plugin {
  validateOptions(userOptions)
  const options = resolveOptions(userOptions)
  let isBuild = false
  const ctx: PluginContext = { cache: createMemoryCache(), options }
  return {
    name: 'vite:svg-icons',
    configResolved(resolvedConfig) {
      isBuild = resolvedConfig.command === 'build'
    },
    resolveId(id) {
      if (!resolveVirtualTypeFromId(id)) {
        return null
      }
      return id.startsWith('\0') ? id : '\0' + id
    },
    load: async (id, ssr) => {
      const moduleType = resolveVirtualTypeFromId(id)
      if (!moduleType) {
        return null
      }
      if (!isBuild && !ssr) {
        return null
      }
      return await renderVirtualModule(ctx, moduleType, { isBuild, ssr: !!ssr })
    },
    configureServer: ({ middlewares }) => {
      //TODO: use the use(route, handle) replacement
      middlewares.use(async (req, res, next) => {
        const url = normalizePath(req.url!)
        const moduleType = resolveVirtualTypeFromUrl(url)
        if (moduleType) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'no-cache')
          const content = await renderVirtualModule(ctx, moduleType, { isBuild: false, ssr: false })
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
