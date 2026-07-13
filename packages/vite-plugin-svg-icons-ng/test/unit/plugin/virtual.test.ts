import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  VIRTUAL_IDS,
  VIRTUAL_IDS_URL,
  VIRTUAL_NAMES_DEPRECATED,
  VIRTUAL_NAMES_URL_DEPRECATED,
  VIRTUAL_REGISTER,
  VIRTUAL_REGISTER_DEPRECATED,
  VIRTUAL_REGISTER_URL,
  VIRTUAL_REGISTER_URL_DEPRECATED,
  VIRTUAL_SPRITE,
  VIRTUAL_SPRITE_URL,
} from '../../../src/constants'
import { renderVirtualModule, resolveVirtualTypeFromId, resolveVirtualTypeFromUrl } from '../../../src/plugin/virtual'
import type { CompileResult, PluginContext } from '../../../src/types'

function createPluginContext(): PluginContext {
  return {
    options: {
      iconDirs: ['icons'],
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last',
      htmlMode: 'script',
      customDomId: '__svg__icons__dom__',
      strokeOverride: false,
      failOnError: false,
      bakerOptions: {},
    },
    cache: {
      get: vi.fn(),
      set: vi.fn(),
      invalidate: vi.fn(),
    },
    compiler: {
      getResult: vi.fn(),
      invalidate: vi.fn(),
      isIconFile: vi.fn(),
    },
  }
}

function createCompileResult(overrides: Partial<CompileResult> = {}): CompileResult {
  return {
    symbols: ['<symbol id="icon-a"></symbol>'],
    ids: ['icon-a'],
    sprite: '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-a"></symbol></svg>',
    iconsByFile: new Map(),
    ...overrides,
  }
}

function mockCompileResult(ctx: PluginContext, overrides: Partial<CompileResult> = {}): void {
  vi.mocked(ctx.compiler.getResult).mockResolvedValue(createCompileResult(overrides))
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('virtual module resolution', () => {
  test('resolves preferred, deprecated, and prefixed module ids', () => {
    expect(resolveVirtualTypeFromId(VIRTUAL_REGISTER)).toBe('register')
    expect(resolveVirtualTypeFromId(VIRTUAL_REGISTER_DEPRECATED)).toBe('register')
    expect(resolveVirtualTypeFromId(`\0${VIRTUAL_REGISTER}`)).toBe('register')

    expect(resolveVirtualTypeFromId(VIRTUAL_IDS)).toBe('ids')
    expect(resolveVirtualTypeFromId(VIRTUAL_NAMES_DEPRECATED)).toBe('ids')
    expect(resolveVirtualTypeFromId(`\0${VIRTUAL_IDS}`)).toBe('ids')
    expect(resolveVirtualTypeFromId(VIRTUAL_SPRITE)).toBe('sprite')

    expect(resolveVirtualTypeFromId('virtual:unknown')).toBeNull()
  })

  test('resolves preferred and deprecated module urls', () => {
    expect(resolveVirtualTypeFromUrl(VIRTUAL_REGISTER_URL)).toBe('register')
    expect(resolveVirtualTypeFromUrl(VIRTUAL_REGISTER_URL_DEPRECATED)).toBe('register')

    expect(resolveVirtualTypeFromUrl(VIRTUAL_IDS_URL)).toBe('ids')
    expect(resolveVirtualTypeFromUrl(VIRTUAL_NAMES_URL_DEPRECATED)).toBe('ids')
    expect(resolveVirtualTypeFromUrl(VIRTUAL_SPRITE_URL)).toBe('sprite')

    expect(resolveVirtualTypeFromUrl('/@id/__x00__virtual:unknown')).toBeNull()
  })
})

describe('virtual module rendering', () => {
  test('returns an empty register module for dev SSR without compiling icons', async () => {
    const ctx = createPluginContext()

    await expect(renderVirtualModule(ctx, 'register', { isBuild: false, ssr: true })).resolves.toBe('export default {}')
    expect(ctx.compiler.getResult).not.toHaveBeenCalled()
  })

  test('renders ids in SSR and client paths', async () => {
    const ctx = createPluginContext()
    mockCompileResult(ctx)

    await expect(renderVirtualModule(ctx, 'ids', { isBuild: false, ssr: true })).resolves.toBe('export default ["icon-a"]')
    await expect(renderVirtualModule(ctx, 'ids', { isBuild: true, ssr: false })).resolves.toBe('export default ["icon-a"]')
    expect(ctx.compiler.getResult).toHaveBeenCalledTimes(2)
  })

  test('renders a register module for client execution independently from htmlMode', async () => {
    const ctx = createPluginContext()
    ctx.options.htmlMode = 'none'
    mockCompileResult(ctx)

    const content = await renderVirtualModule(ctx, 'register', { isBuild: true, ssr: false })

    expect(content).toContain('svg-icons:update')
    expect(content).toContain('new DOMParser()')
    expect(content).toContain('document.createElementNS')
    expect(ctx.compiler.getResult).toHaveBeenCalledTimes(1)
  })

  test('renders the sprite module as an escaped JavaScript string', async () => {
    const ctx = createPluginContext()
    mockCompileResult(ctx)

    const content = await renderVirtualModule(ctx, 'sprite', { isBuild: false, ssr: false })

    expect(content).toContain('export default "<svg')
    expect(content).toContain('id=\\"__svg__icons__dom__\\"')
    expect(content).toContain('<symbol id=\\"icon-a\\"></symbol>')
  })

  test('reads the latest sprite after compiler invalidation in SSR', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult)
      .mockResolvedValueOnce(createCompileResult())
      .mockResolvedValueOnce(
        createCompileResult({
          symbols: ['<symbol id="icon-b"></symbol>'],
          ids: ['icon-b'],
          sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-b"></symbol></svg>',
        })
      )

    const first = await renderVirtualModule(ctx, 'sprite', { isBuild: false, ssr: true })
    ctx.compiler.invalidate('/repo/icons/a.svg')
    const second = await renderVirtualModule(ctx, 'sprite', { isBuild: false, ssr: true })

    expect(first).toContain('icon-a')
    expect(second).toContain('icon-b')
    expect(ctx.compiler.invalidate).toHaveBeenCalledWith('/repo/icons/a.svg')
  })
})
