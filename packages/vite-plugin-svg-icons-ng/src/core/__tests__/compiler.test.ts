import { afterEach, describe, expect, test, vi } from 'vitest'
import { createCompiler } from '../compiler'
import { transformIcon } from '../transformer'
import type { CompilerContext } from '../../types'

const hoisted = vi.hoisted(() => ({
  baker: {
    bakeIcon: vi.fn(),
    bakeIcons: vi.fn(),
  },
  files: [{ file: 'D:/repo/src/icons/a.svg', iconDir: 'D:/repo/src/icons', relativePath: 'a.svg' }],
  source: {
    file: 'D:/repo/src/icons/a.svg',
    iconDir: 'D:/repo/src/icons',
    relativePath: 'a.svg',
    code: '<svg></svg>',
    hash: 'hash-a',
  },
  icon: {
    file: 'D:/repo/src/icons/a.svg',
    id: 'icon-a',
    symbol: '<symbol id="icon-a"></symbol>',
    hash: 'hash-a',
  },
}))

vi.mock('svg-icon-baker', () => ({
  createBaker: vi.fn(() => hoisted.baker),
}))

vi.mock('../scanner', () => ({
  scanIconDirs: vi.fn(async () => hoisted.files),
}))

vi.mock('../transformer', () => ({
  loadIconSource: vi.fn(async () => hoisted.source),
  transformIcon: vi.fn(async () => hoisted.icon),
}))

function createCompilerContext(): CompilerContext {
  return {
    cache: {
      get: vi.fn(() => null),
      set: vi.fn(),
      invalidate: vi.fn(),
    },
    logger: {
      hasWarned: false,
      hasErrorLogged: () => false,
      clearScreen: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      warnOnce: vi.fn(),
      error: vi.fn(),
    },
    options: {
      iconDirs: ['D:/repo/src/icons'],
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last',
      customDomId: '__svg__icons__dom__',
      strokeOverride: false,
      failOnError: false,
      bakerOptions: {},
    },
  }
}

describe('compiler', () => {
  afterEach(() => {
    vi.clearAllMocks()
    hoisted.files = [{ file: 'D:/repo/src/icons/a.svg', iconDir: 'D:/repo/src/icons', relativePath: 'a.svg' }]
    hoisted.source = {
      file: 'D:/repo/src/icons/a.svg',
      iconDir: 'D:/repo/src/icons',
      relativePath: 'a.svg',
      code: '<svg></svg>',
      hash: 'hash-a',
    }
    hoisted.icon = {
      file: 'D:/repo/src/icons/a.svg',
      id: 'icon-a',
      symbol: '<symbol id="icon-a"></symbol>',
      hash: 'hash-a',
    }
    hoisted.baker = {
      bakeIcon: vi.fn(),
      bakeIcons: vi.fn(),
    }
  })

  test('should dedupe concurrent compile requests', async () => {
    const ctx = createCompilerContext()
    const compiler = createCompiler(ctx)
    const [a, b] = await Promise.all([compiler.getResult(), compiler.getResult()])

    expect(a).toEqual(b)
  })

  test('should reuse compile result before invalidation and recompile after invalidation', async () => {
    const ctx = createCompilerContext()
    const compiler = createCompiler(ctx)

    const first = await compiler.getResult()
    const second = await compiler.getResult()

    expect(first).toEqual(second)
    expect(ctx.cache.set).toHaveBeenCalledTimes(1)

    compiler.invalidate('D:/repo/src/icons/a.svg')

    hoisted.source.hash = 'hash-b'
    hoisted.icon = {
      file: 'D:/repo/src/icons/a.svg',
      id: 'icon-b',
      symbol: '<symbol id="icon-b"></symbol>',
      hash: 'hash-b',
    }

    const third = await compiler.getResult()
    expect(third.ids).toEqual(['icon-b'])
    expect(ctx.cache.invalidate).toHaveBeenCalledWith('D:/repo/src/icons/a.svg')
  })

  test('should match svg file inside icon dirs only', () => {
    const compiler = createCompiler(createCompilerContext())
    expect(compiler.isIconFile('D:/repo/src/icons/home.svg')).toBe(true)
    expect(compiler.isIconFile('D:/repo/src/icons/sub/menu.SVG')).toBe(true)
    expect(compiler.isIconFile('D:/repo/src/assets/home.svg')).toBe(false)
    expect(compiler.isIconFile('D:/repo/src/icons/readme.md')).toBe(false)
  })

  test('should warn and skip duplicate symbolId by default', async () => {
    const ctx = createCompilerContext()
    hoisted.files = [
      { file: 'D:/repo/src/icons/a.svg', iconDir: 'D:/repo/src/icons', relativePath: 'a.svg' },
      { file: 'D:/repo/src/icons/b.svg', iconDir: 'D:/repo/src/icons', relativePath: 'b.svg' },
    ]
    vi.mocked(ctx.cache.get).mockReturnValueOnce({
      file: 'D:/repo/src/icons/a.svg',
      id: 'icon-duplicate',
      symbol: '<symbol id="icon-duplicate"><path id="a"/></symbol>',
      hash: 'hash-a',
    })
    vi.mocked(ctx.cache.get).mockReturnValueOnce({
      file: 'D:/repo/src/icons/b.svg',
      id: 'icon-duplicate',
      symbol: '<symbol id="icon-duplicate"><path id="b"/></symbol>',
      hash: 'hash-b',
    })
    const compiler = createCompiler(ctx)

    const result = await compiler.getResult()

    expect(result.ids).toEqual(['icon-duplicate'])
    expect(result.sprite).toContain('id="a"')
    expect(result.sprite).not.toContain('id="b"')
    expect(ctx.logger?.warn).toHaveBeenCalledWith(expect.stringContaining('Duplicate symbolId "icon-duplicate"'))
  })

  test('should throw duplicate symbolId when failOnError is true', async () => {
    const ctx = createCompilerContext()
    ctx.options.failOnError = true
    hoisted.files = [
      { file: 'D:/repo/src/icons/a.svg', iconDir: 'D:/repo/src/icons', relativePath: 'a.svg' },
      { file: 'D:/repo/src/icons/b.svg', iconDir: 'D:/repo/src/icons', relativePath: 'b.svg' },
    ]
    vi.mocked(ctx.cache.get).mockReturnValueOnce({
      file: 'D:/repo/src/icons/a.svg',
      id: 'icon-duplicate',
      symbol: '<symbol id="icon-duplicate"></symbol>',
      hash: 'hash-a',
    })
    vi.mocked(ctx.cache.get).mockReturnValueOnce({
      file: 'D:/repo/src/icons/b.svg',
      id: 'icon-duplicate',
      symbol: '<symbol id="icon-duplicate"></symbol>',
      hash: 'hash-b',
    })
    const compiler = createCompiler(ctx)

    await expect(compiler.getResult()).rejects.toThrow('Duplicate symbolId "icon-duplicate"')
  })

  test('should preserve baker error details when failOnError is true', async () => {
    const ctx = createCompilerContext()
    ctx.options.failOnError = true
    const bakeError = Object.assign(new Error('Input must start with an <svg> root element.'), {
      name: 'BakeError',
      code: 'ValidateSvgRootInvalid',
    })
    vi.mocked(transformIcon).mockRejectedValueOnce(bakeError)
    const compiler = createCompiler(ctx)

    await expect(compiler.getResult()).rejects.toMatchObject({
      message: 'Failed on icon D:/repo/src/icons/a.svg, Input must start with an <svg> root element.',
      cause: bakeError,
    })
  })
})
