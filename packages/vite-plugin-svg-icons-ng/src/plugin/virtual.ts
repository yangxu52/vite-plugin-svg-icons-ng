import {
  VIRTUAL_SPRITE,
  VIRTUAL_SPRITE_URL,
  VIRTUAL_IDS,
  VIRTUAL_IDS_URL,
  VIRTUAL_NAMES_DEPRECATED,
  VIRTUAL_NAMES_URL_DEPRECATED,
  VIRTUAL_REGISTER,
  VIRTUAL_REGISTER_DEPRECATED,
  VIRTUAL_REGISTER_URL,
  VIRTUAL_REGISTER_URL_DEPRECATED,
} from '../constants'
import type { CompileResult, PluginContext, ResolvedOptions, VirtualModuleRenderContext, VirtualModuleType } from '../types'
import { renderRegisterModule } from './runtime'

export function resolveVirtualTypeFromId(id: string): VirtualModuleType | null {
  const normalizedId = id.startsWith('\0') ? id.slice(1) : id
  if (normalizedId === VIRTUAL_REGISTER_DEPRECATED || normalizedId === VIRTUAL_REGISTER) {
    return 'register'
  }
  if (normalizedId === VIRTUAL_NAMES_DEPRECATED || normalizedId === VIRTUAL_IDS) {
    return 'ids'
  }
  if (normalizedId === VIRTUAL_SPRITE) {
    return 'sprite'
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
  if (url.endsWith(VIRTUAL_SPRITE_URL)) {
    return 'sprite'
  }
  return null
}

export async function renderVirtualModule(ctx: PluginContext, moduleType: VirtualModuleType, renderCtx: VirtualModuleRenderContext): Promise<string> {
  if (moduleType === 'register' && renderCtx.ssr && !renderCtx.isBuild) {
    return 'export default {}'
  }
  const result = await ctx.compiler.getResult()
  if (moduleType === 'register') {
    return toRegisterCode(result, ctx.options)
  }
  if (moduleType === 'sprite') {
    return toSpriteModule(result)
  }
  return toIdsCode(result)
}

function toIdsCode(result: CompileResult): string {
  return `export default ${JSON.stringify(result.ids)}`
}

function toRegisterCode(result: CompileResult, options: ResolvedOptions): string {
  return renderRegisterModule(result, options)
}

function toSpriteModule(result: CompileResult): string {
  return `export default ${JSON.stringify(renderSpriteElement(result))}`
}

export function renderSpriteElement(result: CompileResult): string {
  return result.sprite
}
