import { readFile } from 'node:fs/promises'
import type { Baker } from 'svg-icon-baker'
import type { CompiledIconEntry, IconFile, IconSource, ResolvedOptions } from '../types'
import { PLUGIN_NAME, REGEXP_SYMBOL_ID } from '../constants'
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

export async function transformIcon(source: IconSource, options: ResolvedOptions, baker: Baker): Promise<CompiledIconEntry> {
  const id = generateSymbolId(source.relativePath, options)
  if (!REGEXP_SYMBOL_ID.test(id)) {
    throw new Error(
      `[${PLUGIN_NAME}]: Generated symbolId "${id}" for "${source.file}" is invalid. Check the file name/path and 'symbolId' template "${options.symbolId}".`
    )
  }
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
