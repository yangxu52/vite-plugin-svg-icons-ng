import { afterEach, describe, expect, test, vi } from 'vitest'
import { pluginConfigureServer, pluginHandleHotUpdate } from '../server'
import type { PluginContext } from '../../types'

function createPluginContext(): PluginContext {
  return {
    options: {
      iconDirs: ['/repo/icons', '/repo/shared-icons'],
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last',
      htmlMode: 'script',
      customDomId: '__svg__icons__dom__',
      strokeOverride: false,
      bakerOptions: {},
      failOnError: false,
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

describe('plugin server hooks', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('pluginConfigureServer should watch all icon dirs', () => {
    const ctx = createPluginContext()
    const add = vi.fn()
    const on = vi.fn()
    const server = { watcher: { add, on } } as never

    pluginConfigureServer(ctx, server)

    expect(add).toHaveBeenCalledTimes(2)
    expect(add).toHaveBeenNthCalledWith(1, '/repo/icons')
    expect(add).toHaveBeenNthCalledWith(2, '/repo/shared-icons')
    expect(on).toHaveBeenCalledTimes(2)
    expect(on).toHaveBeenNthCalledWith(1, 'add', expect.any(Function))
    expect(on).toHaveBeenNthCalledWith(2, 'unlink', expect.any(Function))
  })

  test.each(['add', 'unlink'] as const)('pluginConfigureServer should invalidate on %s icon files', async (event) => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.isIconFile).mockReturnValue(true)
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      ids: ['icon-home'],
      symbols: ['<symbol id="icon-home"></symbol>'],
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-home"></symbol></svg>',
      iconsByFile: new Map(),
    })
    const handlers = new Map<string, (file: string) => void>()
    const on = vi.fn((event: string, handler: (file: string) => void) => {
      handlers.set(event, handler)
    })
    const add = vi.fn()
    const send = vi.fn()
    const getModuleById = vi.fn()
    const invalidateModule = vi.fn()
    const invalidateAll = vi.fn()
    const server = {
      watcher: { add, on },
      ws: { send },
      moduleGraph: { getModuleById, invalidateModule, invalidateAll },
    } as never

    pluginConfigureServer(ctx, server)

    handlers.get(event)?.('/repo/icons/new.svg')
    await Promise.resolve()
    await Promise.resolve()

    expect(ctx.compiler.invalidate).toHaveBeenCalledWith('/repo/icons/new.svg')
    expect(send).toHaveBeenCalledWith({
      type: 'custom',
      event: 'svg-icons:update',
      data: { sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-home"></symbol></svg>' },
    })
    expect(getModuleById).toHaveBeenCalledTimes(5)
    expect(invalidateAll).toHaveBeenCalledTimes(1)
  })

  test('pluginHandleHotUpdate should ignore non-icon files', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.isIconFile).mockReturnValue(false)
    const send = vi.fn()
    const getModuleById = vi.fn()
    const invalidateModule = vi.fn()
    const invalidateAll = vi.fn()
    const hotUpdateCtx = {
      file: '/repo/src/main.ts',
      server: {
        ws: { send },
        moduleGraph: { getModuleById, invalidateModule, invalidateAll },
      },
    } as never

    const result = await pluginHandleHotUpdate(ctx, hotUpdateCtx)

    expect(result).toBeUndefined()
    expect(ctx.compiler.invalidate).not.toHaveBeenCalled()
    expect(getModuleById).not.toHaveBeenCalled()
    expect(invalidateModule).not.toHaveBeenCalled()
    expect(invalidateAll).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  test('pluginHandleHotUpdate should invalidate icon and emit custom sprite update', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.isIconFile).mockReturnValue(true)
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      ids: ['icon-home'],
      symbols: ['<symbol id="icon-home"></symbol>'],
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-home"></symbol></svg>',
      iconsByFile: new Map(),
    })
    const send = vi.fn()
    const invalidateModule = vi.fn()
    const invalidateAll = vi.fn()
    const modules = new Map<string, object>([
      ['\0virtual:svg-icons/register', { id: '\0virtual:svg-icons/register' }],
      ['\0virtual:svg-icons/ids', { id: '\0virtual:svg-icons/ids' }],
      ['\0virtual:svg-icons/sprite', { id: '\0virtual:svg-icons/sprite' }],
    ])
    const getModuleById = vi.fn((id: string) => modules.get(id))
    const hotUpdateCtx = {
      file: '/repo/icons/home.svg',
      server: {
        ws: { send },
        moduleGraph: { getModuleById, invalidateModule, invalidateAll },
      },
    } as never

    const result = await pluginHandleHotUpdate(ctx, hotUpdateCtx)

    expect(result).toEqual([])
    expect(ctx.compiler.invalidate).toHaveBeenCalledWith('/repo/icons/home.svg')
    expect(getModuleById).toHaveBeenCalledTimes(5)
    expect(invalidateModule).toHaveBeenCalledTimes(3)
    expect(invalidateAll).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith({
      type: 'custom',
      event: 'svg-icons:update',
      data: { sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-home"></symbol></svg>' },
    })
  })

  test('pluginHandleHotUpdate should update sprite on changed icon files', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.isIconFile).mockReturnValue(true)
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      ids: ['icon-updated'],
      symbols: ['<symbol id="icon-updated"></symbol>'],
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-updated"></symbol></svg>',
      iconsByFile: new Map(),
    })
    const send = vi.fn()
    const invalidateAll = vi.fn()
    const hotUpdateCtx = {
      file: '/repo/icons/home.svg',
      server: {
        ws: { send },
        moduleGraph: {
          getModuleById: vi.fn(),
          invalidateModule: vi.fn(),
          invalidateAll,
        },
      },
    } as never

    const result = await pluginHandleHotUpdate(ctx, hotUpdateCtx)

    expect(result).toEqual([])
    expect(ctx.compiler.invalidate).toHaveBeenCalledWith('/repo/icons/home.svg')
    expect(invalidateAll).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith({
      type: 'custom',
      event: 'svg-icons:update',
      data: { sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-updated"></symbol></svg>' },
    })
  })
})
