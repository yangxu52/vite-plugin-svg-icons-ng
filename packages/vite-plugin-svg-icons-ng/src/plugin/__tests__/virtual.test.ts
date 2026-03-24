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
} from '../../constants'
import { renderVirtualModule, resolveVirtualTypeFromId, resolveVirtualTypeFromUrl } from '../virtual'
import type { PluginContext } from '../../types'

const createPluginContext = (): PluginContext => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
  },
  options: {
    iconDirs: ['icons'],
    symbolId: 'icon-[dir]-[name]',
    inject: 'body-last',
    customDomId: '__svg__icons__dom__',
    strokeOverride: false,
    optimize: true,
    failOnError: false,
  },
  compiler: {
    getResult: vi.fn(),
    invalidate: vi.fn(),
    isIconFile: vi.fn(),
  },
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('plugin virtual module resolver', () => {
  test('resolveVirtualTypeFromId should resolve new/deprecated and prefixed ids', () => {
    expect(resolveVirtualTypeFromId(VIRTUAL_REGISTER)).toBe('register')
    expect(resolveVirtualTypeFromId(VIRTUAL_REGISTER_DEPRECATED)).toBe('register')
    expect(resolveVirtualTypeFromId(`\0${VIRTUAL_REGISTER}`)).toBe('register')

    expect(resolveVirtualTypeFromId(VIRTUAL_IDS)).toBe('ids')
    expect(resolveVirtualTypeFromId(VIRTUAL_NAMES_DEPRECATED)).toBe('ids')
    expect(resolveVirtualTypeFromId(`\0${VIRTUAL_IDS}`)).toBe('ids')
    expect(resolveVirtualTypeFromId(VIRTUAL_SPRITE)).toBe('sprite')

    expect(resolveVirtualTypeFromId('virtual:unknown')).toBeNull()
  })

  test('resolveVirtualTypeFromUrl should resolve new/deprecated urls', () => {
    expect(resolveVirtualTypeFromUrl(VIRTUAL_REGISTER_URL)).toBe('register')
    expect(resolveVirtualTypeFromUrl(VIRTUAL_REGISTER_URL_DEPRECATED)).toBe('register')

    expect(resolveVirtualTypeFromUrl(VIRTUAL_IDS_URL)).toBe('ids')
    expect(resolveVirtualTypeFromUrl(VIRTUAL_NAMES_URL_DEPRECATED)).toBe('ids')
    expect(resolveVirtualTypeFromUrl(VIRTUAL_SPRITE_URL)).toBe('sprite')

    expect(resolveVirtualTypeFromUrl('/@id/__x00__virtual:unknown')).toBeNull()
  })
})

describe('plugin virtual module render', () => {
  test('should return empty object module in dev ssr', async () => {
    const ctx = createPluginContext()
    const content = await renderVirtualModule(ctx, 'register', { isBuild: false, ssr: true })

    expect(content).toBe('export default {}')
    expect(ctx.compiler.getResult).not.toHaveBeenCalled()
  })

  test('should render ids module in dev ssr path', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
    })

    const content = await renderVirtualModule(ctx, 'ids', { isBuild: false, ssr: true })

    expect(content).toBe('export default ["icon-a"]')
    expect(ctx.compiler.getResult).toHaveBeenCalledTimes(1)
  })

  test('should render register module in build/dev client path', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
    })

    const content = await renderVirtualModule(ctx, 'register', { isBuild: true, ssr: false })

    expect(content).toContain('document.createElementNS')
    expect(content).toContain('<symbol id=\\"icon-a\\"></symbol>')
    expect(ctx.compiler.getResult).toHaveBeenCalledTimes(1)
  })

  test('should render ids module in build/dev client path', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
    })

    const content = await renderVirtualModule(ctx, 'ids', { isBuild: true, ssr: false })

    expect(content).toBe('export default ["icon-a"]')
    expect(ctx.compiler.getResult).toHaveBeenCalledTimes(1)
  })

  test('should render sprite module in build/dev client path', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
    })

    const content = await renderVirtualModule(ctx, 'sprite', { isBuild: false, ssr: false })

    expect(content).toContain('export default "<svg')
    expect(content).toContain('id=\\"__svg__icons__dom__\\"')
    expect(content).toContain('<symbol id=\\"icon-a\\"></symbol>')
    expect(ctx.compiler.getResult).toHaveBeenCalledTimes(1)
  })
})
