import { readFile } from 'node:fs/promises'
import type { Baker } from 'svg-icon-baker'
import type { CompiledIcon, IconFile, IconSource, ResolvedOptions } from '../types'
import { getWeakETag } from '../utils/hash'
import { generateSymbolId } from '../utils/path'

export async function loadIconSource(iconFile: IconFile): Promise<IconSource> {
  const code = await readFile(iconFile.file, 'utf-8')
  return {
    ...iconFile,
    code,
    hash: getWeakETag(code),
  }
}

export async function transformIcon(source: IconSource, options: ResolvedOptions, baker: Baker): Promise<CompiledIcon> {
  const id = generateSymbolId(source.relativePath, options)
  const { content, issues } = baker.bakeIcon({ name: id, content: source.code })
  return {
    file: source.file,
    id,
    symbol: applyStrokeOverride(content, options),
    hash: source.hash,
    issues,
  }
}

function applyStrokeOverride(symbol: string, options: ResolvedOptions): string {
  if (options.strokeOverride === false) {
    return symbol
  }
  return symbol.replace(/\bstroke="[^"]*"/gi, `stroke="${options.strokeOverride}"`)
}
