import { IDS_TEMPLATE, SPRITE_TEMPLATE } from '../constants'
import type { CompileResult, ResolvedOptions } from '../types'

export function renderIdsModule(result: CompileResult): string {
  return IDS_TEMPLATE(JSON.stringify(result.ids))
}

export function renderSpriteModule(result: CompileResult, options: ResolvedOptions): string {
  return SPRITE_TEMPLATE(JSON.stringify(result.symbols.join('')), options.customDomId, options.inject)
}
