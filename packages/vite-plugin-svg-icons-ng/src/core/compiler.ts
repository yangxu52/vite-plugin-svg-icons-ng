import { normalizePath } from 'vite'
import { PLUGIN_NAME } from '../constants'
import { buildCompileResult } from './builder'
import { scanIconDirs } from './scanner'
import { loadIconSource, transformIcon } from './transformer'
import type { CompileResult, CompiledIcon, CompilerContext, CompilerState, IconCompiler } from '../types'

function normalizeFsPath(filePath: string): string {
  const normalized = normalizePath(filePath)
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized
}

export function createCompiler(ctx: CompilerContext): IconCompiler {
  const iconDirs = ctx.options.iconDirs.map((dir) => {
    const normalized = normalizeFsPath(dir)
    return normalized.endsWith('/') ? normalized : `${normalized}/`
  })

  let inFlight: Promise<CompileResult> | null = null
  const state: CompilerState = {
    dirty: true,
    result: null,
  }

  function isIconFile(file: string): boolean {
    const normalized = normalizeFsPath(file)
    if (!normalized.toLowerCase().endsWith('.svg')) {
      return false
    }
    return iconDirs.some((dir) => normalized.startsWith(dir))
  }

  async function getResult(): Promise<CompileResult> {
    if (!state.dirty && state.result) {
      return state.result
    }
    if (inFlight) {
      return await inFlight
    }
    inFlight = compileIcons(ctx)
      .then((result) => {
        state.result = result
        state.dirty = false
        return result
      })
      .finally(() => {
        inFlight = null
      })
    return await inFlight
  }

  function invalidate(file?: string): void {
    if (file) {
      ctx.cache.invalidate(file)
    }
    state.dirty = true
  }

  return { getResult, invalidate, isIconFile }
}

async function compileIcons(ctx: CompilerContext): Promise<CompileResult> {
  const warnings: string[] = []
  const files = await scanIconDirs(ctx.options.iconDirs)
  const icons = (
    await Promise.all(
      files.map(async (iconFile) => {
        try {
          const source = await loadIconSource(iconFile)
          const cached = ctx.cache.get(iconFile.file, source.hash)
          if (cached) {
            return cached
          }
          const icon = await transformIcon(source, ctx.options)
          ctx.cache.set(icon.file, { hash: icon.hash, icon })
          return icon
        } catch (error) {
          const normalizedError = normalizeBuildError(iconFile.file, error)
          if (ctx.options.failOnError) {
            throw normalizedError
          }
          warnings.push(toWarnMessage(normalizedError))
          return null
        }
      })
    )
  ).filter((icon): icon is CompiledIcon => icon !== null)
  for (const warning of warnings) {
    // eslint-disable-next-line no-console
    console.warn(warning)
  }
  return buildCompileResult(icons, ctx.options)
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
