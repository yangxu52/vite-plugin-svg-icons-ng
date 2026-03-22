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
  XMLNS,
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
    return toSpriteModule(result, ctx.options)
  }
  return toIdsCode(result)
}

function toIdsCode(result: BuildResult): string {
  return `export default ${JSON.stringify(result.ids)}`
}

function toRegisterCode(result: BuildResult, options: ResolvedOptions): string {
  const symbolStr = JSON.stringify(result.symbols.join(''))
  const insertBefore = options.inject === 'body-first' ? 'document.body.firstChild' : null
  return `if (typeof window !== 'undefined') {
  (function() {
    const loadSvgSprite = function() {
      let html = ${symbolStr};
      let svg = document.getElementById('${options.customDomId}');
      if (!svg) {
        svg = document.createElementNS('${XMLNS}', 'svg');
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        svg.id = '${options.customDomId}';
        svg.setAttribute('xmlns', '${XMLNS}');
        svg.setAttribute('aria-hidden', true);
        svg.innerHTML = html;
        document.body.insertBefore(svg, ${insertBefore});
      } else {
        return;
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadSvgSprite);
    } else {
      loadSvgSprite();
    }
  })();
}
export default {}`
}

function toSpriteModule(result: BuildResult, options: ResolvedOptions): string {
  return `export default ${JSON.stringify(renderSpriteElement(result, options))}`
}

export function renderSpriteElement(result: BuildResult, options: ResolvedOptions): string {
  return `<svg id="${options.customDomId}" xmlns="${XMLNS}" aria-hidden="true" style="position:absolute;width:0;height:0">${result.symbols.join('')}</svg>`
}
