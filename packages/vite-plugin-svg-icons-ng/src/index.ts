import type { Plugin } from 'vite'
import type { Options, PluginContext } from './types'
import { createMemoryCache } from './cache/memoryCache'
import { resolveOptions, validateOptions } from './utils/options'
import { loadVirtualModuleById, resolveVirtualId } from './plugin/build'
import { createCompiler } from './core/compiler.ts'

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
    load: async (id, loadOptions) => await loadVirtualModuleById(ctx, id, isBuild, loadOptions),
    configureServer(server) {
      for (const dir of options.iconDirs) {
        server.watcher.add(dir)
      }
    },
    handleHotUpdate(hotUpdateCtx) {
      if (!ctx.compiler.isIconFile(hotUpdateCtx.file)) {
        return
      }
      ctx.compiler.invalidate(hotUpdateCtx.file)
      hotUpdateCtx.server.ws.send({ type: 'full-reload' })
      return []
    },
  }
}

export type { Options } from './types'
