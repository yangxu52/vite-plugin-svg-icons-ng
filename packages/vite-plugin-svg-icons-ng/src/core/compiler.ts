import type { Entry } from 'fast-glob'
import fg from 'fast-glob'
import fs from 'fs-extra'
import { bakeIcon } from 'svg-icon-baker'
import { normalizePath } from 'vite'
import type { CompileContext, CompileResult, ResolvedOptions, SymbolData } from '../types'
import { generateSymbolId } from '../utils'

export async function compileIcons(ctx: CompileContext): Promise<CompileResult> {
  const list = await compileIconSymbols(ctx)
  return {
    symbols: list.map((item) => item.content),
    ids: list.map((item) => item.id),
  }
}

async function compileIconSymbols(ctx: CompileContext) {
  const dirPromises = ctx.options.iconDirs.map(async (dir) => {
    const entryList = await fg.glob('**/*.svg', { cwd: dir, stats: true, absolute: true })
    const entryPromises = entryList.map(async (e) => {
      return await compileEntry(ctx, e, dir)
    })
    return (await Promise.all(entryPromises)).filter(Boolean) as SymbolData[]
  })
  return (await Promise.all(dirPromises)).flat()
}

async function compileEntry(ctx: CompileContext, e: Entry, dir: string) {
  const { path, stats: { mtimeMs } = {} } = e
  const cached = ctx.cache.get(path, mtimeMs)
  if (cached) {
    return cached
  }
  try {
    const relativePath = normalizePath(path).replace(normalizePath(dir + '/'), '') || ''
    const id = generateSymbolId(relativePath, ctx.options)
    const content = await transformIconFile(path, id, ctx.options)
    const symbol = { id, content }
    ctx.cache.set(path, { mtimeMs, symbol })
    return symbol
  } catch {
    return null
  }
}

async function transformIconFile(file: string, symbolId: string, options: ResolvedOptions): Promise<string> {
  const svg = await fs.promises.readFile(file, 'utf-8')
  try {
    const { content } = bakeIcon({ name: symbolId, content: svg }, options.optimize)
    return applyStrokeOverride(content, options)
  } catch (error) {
    throw new Error(`Failed on icon ${file}, ${String(error)}`)
  }
}

function applyStrokeOverride(symbol: string, options: ResolvedOptions): string {
  if (options.strokeOverride === false) {
    return symbol
  } else {
    return symbol.replace(/\bstroke="[^"]*"/gi, `stroke="${options.strokeOverride}"`)
  }
}
