import type { HmrContext, ViteDevServer } from 'vite'
import type { PluginContext } from '../types'

export function pluginConfigureServer(ctx: PluginContext, server: ViteDevServer): void {
  for (const dir of ctx.options.iconDirs) {
    server.watcher.add(dir)
  }
}

export function pluginHandleHotUpdate(ctx: PluginContext, hotUpdateCtx: HmrContext): [] | void {
  if (!ctx.compiler.isIconFile(hotUpdateCtx.file)) {
    return
  }
  ctx.compiler.invalidate(hotUpdateCtx.file)
  hotUpdateCtx.server.ws.send({ type: 'full-reload' })
  return []
}
