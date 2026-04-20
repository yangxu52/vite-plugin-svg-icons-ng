import type { HmrContext, ViteDevServer } from 'vite'
import { HMR_EVENT_SVG_ICONS_UPDATE, VIRTUAL_IDS, VIRTUAL_NAMES_DEPRECATED, VIRTUAL_REGISTER, VIRTUAL_REGISTER_DEPRECATED, VIRTUAL_SPRITE } from '../constants'
import type { PluginContext } from '../types'

const VIRTUAL_MODULE_IDS = [VIRTUAL_REGISTER, VIRTUAL_REGISTER_DEPRECATED, VIRTUAL_IDS, VIRTUAL_NAMES_DEPRECATED, VIRTUAL_SPRITE].map((id) => `\0${id}`)

function invalidateVirtualModules(server: ViteDevServer): void {
  for (const id of VIRTUAL_MODULE_IDS) {
    const mod = server.moduleGraph.getModuleById(id)
    if (!mod) {
      continue
    }
    server.moduleGraph.invalidateModule(mod)
  }
  if (typeof server.moduleGraph.invalidateAll === 'function') {
    server.moduleGraph.invalidateAll()
  }
}

async function applyIconChange(ctx: PluginContext, server: ViteDevServer, file: string): Promise<boolean> {
  if (!ctx.compiler.isIconFile(file)) {
    return false
  }
  ctx.compiler.invalidate(file)
  invalidateVirtualModules(server)
  const result = await ctx.compiler.getResult()
  server.ws.send({
    type: 'custom',
    event: HMR_EVENT_SVG_ICONS_UPDATE,
    data: { sprite: result.sprite },
  })
  return true
}

export function pluginConfigureServer(ctx: PluginContext, server: ViteDevServer): void {
  for (const dir of ctx.options.iconDirs) {
    server.watcher.add(dir)
  }
  const onIconFileAddedOrRemoved = (file: string) => {
    void applyIconChange(ctx, server, file)
  }
  server.watcher.on('add', onIconFileAddedOrRemoved)
  server.watcher.on('unlink', onIconFileAddedOrRemoved)
}

export async function pluginHandleHotUpdate(ctx: PluginContext, hotUpdateCtx: HmrContext): Promise<[] | void> {
  if (!(await applyIconChange(ctx, hotUpdateCtx.server, hotUpdateCtx.file))) {
    return
  }
  return []
}
