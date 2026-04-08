import { afterEach, describe, expect, test, vi } from 'vitest'
import { buildIcons } from '../builder'
import { scanIconDirs } from '../scanner'
import { transformIcon } from '../transformer'
import type { BuildContext } from '../../types'

vi.mock('../scanner', () => ({
  scanIconDirs: vi.fn(),
}))

vi.mock('../transformer', () => ({
  transformIcon: vi.fn(),
}))

function createBuildContext(failOnError: boolean): BuildContext {
  return {
    cache: {
      get: vi.fn(() => null),
      set: vi.fn(),
      invalidate: vi.fn(),
    },
    options: {
      iconDirs: ['/repo/icons'],
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last',
      customDomId: '__svg__icons__dom__',
      strokeOverride: false,
      bakerOptions: {},
      failOnError,
    },
  }
}

describe('builder error handling', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should warn and skip broken icon when failOnError is false', async () => {
    const ctx = createBuildContext(false)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    vi.mocked(scanIconDirs).mockResolvedValue([
      {
        dir: '/repo/icons',
        entries: [
          { path: '/repo/icons/good.svg', stats: { mtimeMs: 1 } },
          { path: '/repo/icons/bad.svg', stats: { mtimeMs: 2 } },
        ] as never,
      },
    ])

    vi.mocked(transformIcon).mockImplementation(async (filePath) => {
      if (filePath.includes('bad.svg')) {
        throw new Error('broken svg')
      }
      return '<symbol id="icon-good"></symbol>'
    })

    const result = await buildIcons(ctx)

    expect(result.ids).toEqual(['icon-good'])
    expect(result.symbols).toEqual(['<symbol id="icon-good"></symbol>'])
    expect(ctx.cache.set).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('bad.svg'))
    warnSpy.mockRestore()
  })

  test('should throw when failOnError is true', async () => {
    const ctx = createBuildContext(true)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    vi.mocked(scanIconDirs).mockResolvedValue([
      {
        dir: '/repo/icons',
        entries: [{ path: '/repo/icons/bad.svg', stats: { mtimeMs: 2 } }] as never,
      },
    ])

    vi.mocked(transformIcon).mockRejectedValue(new Error('broken svg'))

    await expect(buildIcons(ctx)).rejects.toThrowError('/repo/icons/bad.svg')
    expect(warnSpy).not.toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
