import type { PluginContext } from '../types'
import { renderVirtualModule, resolveVirtualTypeFromId } from './virtual'

export function resolveVirtualId(id: string): string | null {
  if (!resolveVirtualTypeFromId(id)) {
    return null
  }
  return id.startsWith('\0') ? id : '\0' + id
}

export async function loadVirtualModuleById(
  ctx: PluginContext,
  id: string,
  renderCtx: {
    isBuild: boolean
    ssr?: boolean
  }
): Promise<string | null> {
  const moduleType = resolveVirtualTypeFromId(id)
  if (!moduleType) {
    return null
  }
  if (!renderCtx.isBuild && !renderCtx.ssr) {
    return null
  }
  return await renderVirtualModule(ctx, moduleType, {
    isBuild: renderCtx.isBuild,
    ssr: !!renderCtx.ssr,
  })
}
