import { normalizePath } from 'vite'
import type { BuildContext, BuildResult, SymbolData } from '../types'
import { generateSymbolId } from '../utils/path'
import { scanIconDirs } from './scanner'
import { transformIcon } from './transformer'

export async function buildIcons(ctx: BuildContext): Promise<BuildResult> {
  const list = await buildSymbols(ctx)
  return {
    symbols: list.map((item) => item.content),
    ids: list.map((item) => item.id),
  }
}

async function buildSymbols(ctx: BuildContext) {
  const scannedDirs = await scanIconDirs(ctx.options.iconDirs)
  const dirPromises = scannedDirs.map(async ({ dir, entries }) => {
    const entryPromises = entries.map(async (entry) => {
      return await buildEntry(ctx, entry, dir)
    })
    return (await Promise.all(entryPromises)).filter(Boolean) as SymbolData[]
  })
  return (await Promise.all(dirPromises)).flat()
}

async function buildEntry(ctx: BuildContext, e: { path: string; stats?: { mtimeMs?: number } }, dir: string) {
  const { path, stats: { mtimeMs } = {} } = e
  const cached = ctx.cache.get(path, mtimeMs)
  if (cached) {
    return cached
  }
  try {
    const relativePath = normalizePath(path).replace(normalizePath(dir + '/'), '') || ''
    const id = generateSymbolId(relativePath, ctx.options)
    const content = await transformIcon(path, id, ctx.options)
    const symbol = { id, content }
    ctx.cache.set(path, { mtimeMs, symbol })
    return symbol
  } catch {
    return null
  }
}
