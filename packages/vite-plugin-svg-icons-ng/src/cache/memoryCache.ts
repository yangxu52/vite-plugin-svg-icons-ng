import type { IconCache, SymbolCache, SymbolData } from '../types'

export function createMemoryCache(): IconCache {
  const store = new Map<string, SymbolCache>()
  return {
    get(path: string, mtimeMs?: number): SymbolData | null {
      const cached = store.get(path)
      if (!cached) {
        return null
      }
      return cached.mtimeMs === mtimeMs ? cached.symbol : null
    },
    set(path: string, entry: SymbolCache): void {
      store.set(path, entry)
    },
    invalidate(path: string): void {
      store.delete(path)
    },
  }
}
