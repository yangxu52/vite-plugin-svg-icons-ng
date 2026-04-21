import type { Logger, Plugin } from 'vite'
import { createMemoryCache } from './cache/memoryCache'
import { createCompiler } from './core/compiler'
import { pluginLoad, resolveVirtualId } from './plugin/build'
import { pluginTransformIndexHtml } from './plugin/html'
import { pluginConfigureServer, pluginHandleHotUpdate } from './plugin/server'
import type { Options, PluginContext } from './types'
import { resolveOptionsWithContext, validateOptions } from './utils/options'

export function createSvgIconsPlugin(userOptions: Options): Plugin {
  validateOptions(userOptions)
  let isBuild = false
  let ctx: PluginContext | null = null

  const getContext = (): PluginContext => {
    if (!ctx) {
      throw new Error('[vite-plugin-svg-icons-ng]: plugin context is not initialized. Vite configResolved hook must run before this hook.')
    }
    return ctx
  }

  return {
    name: 'vite:svg-icons',
    configResolved(resolvedConfig) {
      isBuild = resolvedConfig.command === 'build'
      ctx = createPluginContext(userOptions, resolvedConfig.root, resolvedConfig.logger)
    },
    resolveId(id) {
      return resolveVirtualId(id)
    },
    load: async (id, loadOptions) => await pluginLoad(getContext(), id, isBuild, loadOptions),
    transformIndexHtml: async (html) => await pluginTransformIndexHtml(getContext(), html),
    configureServer: (server) => pluginConfigureServer(getContext(), server),
    handleHotUpdate: (hotUpdateCtx) => pluginHandleHotUpdate(getContext(), hotUpdateCtx),
  }
}

function createPluginContext(userOptions: Options, root: string, logger: Logger): PluginContext {
  const options = resolveOptionsWithContext(userOptions, { root })
  const cache = createMemoryCache()
  const compiler = createCompiler({ options, cache })
  return { options, cache, compiler, logger }
}

export type { Options } from './types'
