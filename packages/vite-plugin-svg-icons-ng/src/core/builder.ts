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
  const classAttribute = options.customDomClass === false ? '' : ` class="${options.customDomClass}"`
  const styleAttribute = options.customDomStyle === false ? '' : ` style="${options.customDomStyle}"`
  return `<svg id="${options.customDomId}"${classAttribute} xmlns="${XMLNS}" aria-hidden="true" width="0" height="0"${styleAttribute}>${symbols.join('')}</svg>`
}
