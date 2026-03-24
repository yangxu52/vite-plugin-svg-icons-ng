import { normalizePath } from 'vite'
import { PLUGIN_NAME } from '../constants'
import type { BuildContext, BuildResult, SymbolData } from '../types'
import { generateSymbolId } from '../utils/path'
import { scanIconDirs } from './scanner'
import { transformIcon } from './transformer'

export async function buildIcons(ctx: BuildContext): Promise<BuildResult> {
  const warnings: string[] = []
  const list = await buildSymbols(ctx, warnings)
  for (const warning of warnings) {
    console.warn(warning)
  }
  return {
    symbols: list.map((item) => item.content),
    ids: list.map((item) => item.id),
  }
}

async function buildSymbols(ctx: BuildContext, warnings: string[]) {
  const scannedDirs = await scanIconDirs(ctx.options.iconDirs)
  const dirPromises = scannedDirs.map(async ({ dir, entries }) => {
    const entryPromises = entries.map(async (entry) => {
      return await buildEntry(ctx, entry, dir, warnings)
    })
    return (await Promise.all(entryPromises)).filter(Boolean) as SymbolData[]
  })
  return (await Promise.all(dirPromises)).flat()
}

function normalizeBuildError(file: string, error: unknown): Error {
  if (error instanceof Error) {
    if (error.message.includes(file)) {
      return error
    }
    return new Error(`Failed on icon ${file}, ${error.message}`)
  }
  return new Error(`Failed on icon ${file}, ${String(error)}`)
}

function toWarnMessage(error: Error): string {
  return `[${PLUGIN_NAME}] Skip broken icon: ${error.message}`
}

async function buildEntry(ctx: BuildContext, e: { path: string; stats?: { mtimeMs?: number } }, dir: string, warnings: string[]) {
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
  } catch (error) {
    const normalizedError = normalizeBuildError(path, error)
    if (ctx.options.failOnError) {
      throw normalizedError
    }
    warnings.push(toWarnMessage(normalizedError))
    return null
  }
}
