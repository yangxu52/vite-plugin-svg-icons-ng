import type { Plugin } from 'vite'
import type { Options, PluginContext } from './types'
import { createMemoryCache } from './cache/memoryCache'
import { resolveOptions, validateOptions } from './utils/options'
import { loadVirtualModuleById, resolveVirtualId } from './plugin/build'
import { setupDevMiddleware } from './plugin/dev'

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
      return resolveVirtualId(id)
    },
    load: async (id, ssr) => {
      return await loadVirtualModuleById(ctx, id, {
        isBuild,
        ssr: !!ssr,
      })
    },
    configureServer: ({ middlewares }) => {
      setupDevMiddleware(ctx, middlewares.use.bind(middlewares))
    },
  }
}

export type { Options } from './types'
