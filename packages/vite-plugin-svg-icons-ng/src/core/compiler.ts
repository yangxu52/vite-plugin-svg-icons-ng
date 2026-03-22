import { normalizePath } from 'vite'
import { buildIcons } from './builder'
import type { BuildContext, BuildResult, IconCompiler } from '../types'

function normalizeFsPath(filePath: string): string {
  const normalized = normalizePath(filePath)
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized
}

export function createCompiler(ctx: BuildContext): IconCompiler {
  const iconDirs = ctx.options.iconDirs.map((dir) => {
    const normalized = normalizeFsPath(dir)
    return normalized.endsWith('/') ? normalized : `${normalized}/`
  })

  let inFlight: Promise<BuildResult> | null = null
  let snapshot: BuildResult | null = null
  let dirty = true

  function isIconFile(file: string): boolean {
    const normalized = normalizeFsPath(file)
    if (!normalized.endsWith('.svg')) {
      return false
    }
    return iconDirs.some((dir) => normalized.startsWith(dir))
  }

  async function getResult(): Promise<BuildResult> {
    if (!dirty && snapshot) {
      return snapshot
    }
    if (inFlight) {
      return await inFlight
    }
    inFlight = buildIcons(ctx)
      .then((result) => {
        snapshot = result
        dirty = false
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
    dirty = true
  }

  return { getResult, invalidate, isIconFile }
}
