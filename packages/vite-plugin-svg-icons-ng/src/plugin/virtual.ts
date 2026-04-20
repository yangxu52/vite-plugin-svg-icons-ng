import {
  HMR_EVENT_SVG_ICONS_UPDATE,
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

function toIdsCode(result: CompileResult): string {
  return `export default ${JSON.stringify(result.ids)}`
}

function toRegisterCode(result: CompileResult, options: ResolvedOptions): string {
  const sprite = JSON.stringify(result.sprite)
  const insertBefore = options.inject === 'body-first' ? 'document.body.firstChild' : null
  return `if (typeof window !== 'undefined') {
  (function() {
    const renderSvgSprite = function(html) {
      let svg = document.getElementById('${options.customDomId}');
      if (!svg) {
        const container = document.createElement('div');
        container.innerHTML = html;
        svg = container.firstElementChild;
        if (!svg) {
          return;
        }
        document.body.insertBefore(svg, ${insertBefore});
        return;
      }
      svg.outerHTML = html;
    };
    const loadSvgSprite = function() {
      renderSvgSprite(${sprite});
    };
    if (import.meta.hot) {
      import.meta.hot.on('${HMR_EVENT_SVG_ICONS_UPDATE}', function(data) {
        if (data && typeof data.sprite === 'string') {
          renderSvgSprite(data.sprite);
        }
      });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadSvgSprite);
    } else {
      loadSvgSprite();
    }
  })();
}
export default {}`
}

function toSpriteModule(result: CompileResult, options: ResolvedOptions): string {
  return `export default ${JSON.stringify(renderSpriteElement(result, options))}`
}

export function renderSpriteElement(result: CompileResult, options: ResolvedOptions): string {
  if (result.sprite.includes(`id="${options.customDomId}"`)) {
    return result.sprite
  }
  return result.sprite
}
