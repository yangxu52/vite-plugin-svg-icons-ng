import { describe, expect, test } from 'vitest'
import { createMemoryCache } from '../memoryCache'

describe('memory cache', () => {
  test('should return cached icon when hash matches', () => {
    const cache = createMemoryCache()
    const icon = { file: '/icons/home.svg', id: 'icon-home', symbol: '<symbol id="icon-home"></symbol>', hash: 'hash-1', issues: [] }
    cache.set('/icons/home.svg', { hash: 'hash-1', icon })

    expect(cache.get('/icons/home.svg', 'hash-1')).toEqual(icon)
  })

  test('should return null when hash does not match', () => {
    const cache = createMemoryCache()
    cache.set('/icons/home.svg', {
      hash: 'hash-1',
      icon: { file: '/icons/home.svg', id: 'icon-home', symbol: '<symbol id="icon-home"></symbol>', hash: 'hash-1', issues: [] },
    })

    expect(cache.get('/icons/home.svg', 'hash-2')).toBeNull()
  })

  test('should invalidate cache entry', () => {
    const cache = createMemoryCache()
    cache.set('/icons/home.svg', {
      hash: 'hash-1',
      icon: { file: '/icons/home.svg', id: 'icon-home', symbol: '<symbol id="icon-home"></symbol>', hash: 'hash-1', issues: [] },
    })

    cache.invalidate('/icons/home.svg')
    expect(cache.get('/icons/home.svg', 'hash-1')).toBeNull()
  })
})
