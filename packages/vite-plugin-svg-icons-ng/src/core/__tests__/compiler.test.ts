import { afterEach, describe, expect, test, vi } from 'vitest'
import { createCompiler } from '../compiler'
import type { CompilerContext } from '../../types'

const hoisted = vi.hoisted(() => ({
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
})
