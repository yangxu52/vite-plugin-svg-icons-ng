import { describe, expect, test } from 'vitest'
import { createMemoryCache } from '../memoryCache'

describe('memory cache', () => {
  test('should return cached symbol when mtime matches', () => {
    const cache = createMemoryCache()
    const symbol = { id: 'icon-home', content: '<symbol id="icon-home"></symbol>' }
    cache.set('/icons/home.svg', { mtimeMs: 100, symbol })

    expect(cache.get('/icons/home.svg', 100)).toEqual(symbol)
  })

  test('should return null when mtime does not match', () => {
    const cache = createMemoryCache()
    cache.set('/icons/home.svg', {
      mtimeMs: 100,
      symbol: { id: 'icon-home', content: '<symbol id="icon-home"></symbol>' },
    })

    expect(cache.get('/icons/home.svg', 200)).toBeNull()
  })

  test('should invalidate cache entry', () => {
    const cache = createMemoryCache()
    cache.set('/icons/home.svg', {
      mtimeMs: 100,
      symbol: { id: 'icon-home', content: '<symbol id="icon-home"></symbol>' },
    })

    cache.invalidate('/icons/home.svg')
    expect(cache.get('/icons/home.svg', 100)).toBeNull()
  })
})
