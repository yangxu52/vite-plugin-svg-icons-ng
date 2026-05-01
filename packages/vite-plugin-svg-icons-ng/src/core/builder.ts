import { XMLNS } from '../constants'
import type { CompileResult, CompiledIconEntry, ResolvedOptions } from '../types'

export function buildCompileResult(compiledIcons: CompiledIconEntry[], options: ResolvedOptions): CompileResult {
  const sortedIcons = [...compiledIcons].sort((a, b) => a.id.localeCompare(b.id))
  const symbols = sortedIcons.map((icon) => icon.symbol)
  return {
    ids: sortedIcons.map((icon) => icon.id),
    symbols,
    sprite: renderSprite(symbols, options),
    iconsByFile: new Map(sortedIcons.map((icon) => [icon.file, icon])),
  }
}

function renderSprite(symbols: string[], options: ResolvedOptions): string {
  return `<svg id="${options.customDomId}" xmlns="${XMLNS}" aria-hidden="true" style="position:absolute;width:0;height:0">${symbols.join('')}</svg>`
}
