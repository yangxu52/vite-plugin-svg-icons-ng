import type { CompiledIconEntry, IconCache, IconCacheEntry } from '../types'

export function createMemoryCache(): IconCache {
  const store = new Map<string, IconCacheEntry>()
  return {
    get(path: string, hash: string): CompiledIconEntry | null {
      const cached = store.get(path)
      if (!cached) {
        return null
      }
      return cached.hash === hash ? cached.icon : null
    },
    set(path: string, entry: IconCacheEntry): void {
      store.set(path, entry)
    },
    invalidate(path: string): void {
      store.delete(path)
    },
  }
}
