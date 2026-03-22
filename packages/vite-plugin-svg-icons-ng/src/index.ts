import type { Plugin } from 'vite'
import { createMemoryCache } from './cache/memoryCache'
import { createCompiler } from './core/compiler.ts'
import { pluginLoad, resolveVirtualId } from './plugin/build'
import { pluginTransformIndexHtml } from './plugin/html'
import { pluginConfigureServer, pluginHandleHotUpdate } from './plugin/server.ts'
import type { Options, PluginContext } from './types'
import { resolveOptions, validateOptions } from './utils/options'

export function createSvgIconsPlugin(userOptions: Options): Plugin {
  validateOptions(userOptions)
  const options = resolveOptions(userOptions)
  let isBuild = false
  const cache = createMemoryCache()
  const ctx: PluginContext = {
    cache,
    options,
    compiler: createCompiler({ cache, options }),
  }
  return {
    name: 'vite:svg-icons',
    configResolved(resolvedConfig) {
      isBuild = resolvedConfig.command === 'build'
    },
    resolveId(id) {
      return resolveVirtualId(id)
    },
    load: async (id, loadOptions) => await pluginLoad(ctx, id, isBuild, loadOptions),
    transformIndexHtml: async (html) => await pluginTransformIndexHtml(ctx, html),
    configureServer: (server) => pluginConfigureServer(ctx, server),
    handleHotUpdate: (hotUpdateCtx) => pluginHandleHotUpdate(ctx, hotUpdateCtx),
  }
}

export type { Options } from './types'
