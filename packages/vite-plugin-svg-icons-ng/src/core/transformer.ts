import fs from 'fs-extra'
import { bakeIcon } from 'svg-icon-baker'
import type { ResolvedOptions } from '../types'

export async function transformIcon(file: string, symbolId: string, options: ResolvedOptions): Promise<string> {
  const svg = await fs.promises.readFile(file, 'utf-8')
  try {
    const { content } = bakeIcon({ name: symbolId, content: svg }, options.bakerOptions)
    return applyStrokeOverride(content, options)
  } catch (error) {
    throw new Error(`Failed on icon ${file}, ${String(error)}`)
  }
}

function applyStrokeOverride(symbol: string, options: ResolvedOptions): string {
  if (options.strokeOverride === false) {
    return symbol
  }
  return symbol.replace(/\bstroke="[^"]*"/gi, `stroke="${options.strokeOverride}"`)
}
