import { readFile } from 'node:fs/promises'
import { bakeIcon } from 'svg-icon-baker'
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

export async function transformIcon(source: IconSource, options: ResolvedOptions): Promise<CompiledIcon> {
  const id = generateSymbolId(source.relativePath, options)
  try {
    const { content } = bakeIcon({ name: id, content: source.code }, options.bakerOptions)
    return {
      file: source.file,
      id,
      symbol: applyStrokeOverride(content, options),
      hash: source.hash,
    }
  } catch (error) {
    throw new Error(`Failed on icon ${source.file}, ${String(error)}`)
  }
}

function applyStrokeOverride(symbol: string, options: ResolvedOptions): string {
  if (options.strokeOverride === false) {
    return symbol
  }
  return symbol.replace(/\bstroke="[^"]*"/gi, `stroke="${options.strokeOverride}"`)
}
