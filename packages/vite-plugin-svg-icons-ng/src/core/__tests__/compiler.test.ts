import { afterEach, describe, expect, test, vi } from 'vitest'
import { buildIcons } from '../builder'
import { createCompiler } from '../compiler'
import type { BuildContext } from '../../types'

vi.mock('../builder', () => ({
  buildIcons: vi.fn(),
}))

function createBuildContext(): BuildContext {
  return {
    cache: {
      get: vi.fn(),
      set: vi.fn(),
      invalidate: vi.fn(),
    },
    options: {
      iconDirs: ['D:/repo/src/icons'],
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last',
      customDomId: '__svg__icons__dom__',
      strokeOverride: false,
      bakerOptions: {},
    },
  }
}

describe('compiler', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should dedupe concurrent compile requests', async () => {
    const ctx = createBuildContext()
    const compiler = createCompiler(ctx)
    const result = { symbols: ['<symbol id="icon-a"/>'], ids: ['icon-a'] }

    const mockedBuildIcons = vi.mocked(buildIcons).mockResolvedValue(result)
    const [a, b] = await Promise.all([compiler.getResult(), compiler.getResult()])

    expect(mockedBuildIcons).toHaveBeenCalledTimes(1)
    expect(a).toEqual(result)
    expect(b).toEqual(result)
  })

  test('should reuse snapshot before invalidation and recompile after invalidation', async () => {
    const ctx = createBuildContext()
    const compiler = createCompiler(ctx)
    const mockedBuildIcons = vi.mocked(buildIcons)

    mockedBuildIcons.mockResolvedValueOnce({ symbols: ['A'], ids: ['a'] }).mockResolvedValueOnce({ symbols: ['B'], ids: ['b'] })

    const first = await compiler.getResult()
    const second = await compiler.getResult()
    expect(first).toEqual(second)
    expect(mockedBuildIcons).toHaveBeenCalledTimes(1)

    compiler.invalidate('D:/repo/src/icons/a.svg')
    const third = await compiler.getResult()
    expect(third).toEqual({ symbols: ['B'], ids: ['b'] })
    expect(mockedBuildIcons).toHaveBeenCalledTimes(2)
    expect(ctx.cache.invalidate).toHaveBeenCalledWith('D:/repo/src/icons/a.svg')
  })

  test('should match svg file inside icon dirs only', () => {
    const compiler = createCompiler(createBuildContext())
    expect(compiler.isIconFile('D:/repo/src/icons/home.svg')).toBe(true)
    expect(compiler.isIconFile('D:/repo/src/icons/sub/menu.SVG')).toBe(true)
    expect(compiler.isIconFile('D:/repo/src/assets/home.svg')).toBe(false)
    expect(compiler.isIconFile('D:/repo/src/icons/readme.md')).toBe(false)
  })
})
