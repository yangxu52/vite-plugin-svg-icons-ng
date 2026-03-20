import type { Plugin } from 'vite'
import { normalizePath } from 'vite'
import type { CompileContext, Options } from './types'
import {
  VIRTUAL_IDS,
  VIRTUAL_IDS_URL,
  VIRTUAL_NAMES_DEPRECATED,
  VIRTUAL_NAMES_URL_DEPRECATED,
  VIRTUAL_REGISTER,
  VIRTUAL_REGISTER_DEPRECATED,
  VIRTUAL_REGISTER_URL,
  VIRTUAL_REGISTER_URL_DEPRECATED,
} from './constants'
import { getWeakETag, resolveOptions, validateOptions } from './utils'
import { compileIcons } from './core/compiler'
import { renderIdsModule, renderSpriteModule } from './core/modules'

export function createSvgIconsPlugin(userOptions: Options): Plugin {
  validateOptions(userOptions)
  const options = resolveOptions(userOptions)
  let isBuild = false
  const ctx: CompileContext = { cache: new Map(), options }
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
      const result = await compileIcons(ctx)
      if (isVirtualRegister) {
        return renderSpriteModule(result, options)
      }
      if (isVirtualNames) {
        return renderIdsModule(result)
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
          const result = await compileIcons(ctx)
          if (url.endsWith(VIRTUAL_REGISTER_URL_DEPRECATED) || url.endsWith(VIRTUAL_REGISTER_URL)) {
            content = renderSpriteModule(result, options)
          }
          if (url.endsWith(VIRTUAL_NAMES_URL_DEPRECATED) || url.endsWith(VIRTUAL_IDS_URL)) {
            content = renderIdsModule(result)
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
