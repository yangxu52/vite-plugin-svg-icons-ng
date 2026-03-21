import {
  IDS_TEMPLATE,
  SPRITE_TEMPLATE,
  VIRTUAL_IDS,
  VIRTUAL_IDS_URL,
  VIRTUAL_NAMES_DEPRECATED,
  VIRTUAL_NAMES_URL_DEPRECATED,
  VIRTUAL_REGISTER,
  VIRTUAL_REGISTER_DEPRECATED,
  VIRTUAL_REGISTER_URL,
  VIRTUAL_REGISTER_URL_DEPRECATED,
} from '../constants'
import type { BuildResult, PluginContext, ResolvedOptions, VirtualModuleRenderContext, VirtualModuleType } from '../types'

export function resolveVirtualTypeFromId(id: string): VirtualModuleType | null {
  const normalizedId = id.startsWith('\0') ? id.slice(1) : id
  if (normalizedId === VIRTUAL_REGISTER_DEPRECATED || normalizedId === VIRTUAL_REGISTER) {
    return 'register'
  }
  if (normalizedId === VIRTUAL_NAMES_DEPRECATED || normalizedId === VIRTUAL_IDS) {
    return 'ids'
  }
  return null
}

export function resolveVirtualTypeFromUrl(url: string): VirtualModuleType | null {
  if (url.endsWith(VIRTUAL_REGISTER_URL_DEPRECATED) || url.endsWith(VIRTUAL_REGISTER_URL)) {
    return 'register'
  }
  if (url.endsWith(VIRTUAL_NAMES_URL_DEPRECATED) || url.endsWith(VIRTUAL_IDS_URL)) {
    return 'ids'
  }
  return null
}

export async function renderVirtualModule(ctx: PluginContext, moduleType: VirtualModuleType, renderCtx: VirtualModuleRenderContext): Promise<string> {
  // In dev SSR, keep current compatibility behavior.
  if (renderCtx.ssr && !renderCtx.isBuild) {
    return 'export default {}'
  }
  const result = await ctx.compiler.getResult()
  if (moduleType === 'register') {
    return toSpriteCode(result, ctx.options)
  }
  return toIdsCode(result)
}

function toIdsCode(result: BuildResult): string {
  return IDS_TEMPLATE(JSON.stringify(result.ids))
}

function toSpriteCode(result: BuildResult, options: ResolvedOptions): string {
  return SPRITE_TEMPLATE(JSON.stringify(result.symbols.join('')), options.customDomId, options.inject)
}
