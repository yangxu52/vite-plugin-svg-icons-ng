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
  options: {
    iconDirs: ['icons'],
    symbolId: 'icon-[dir]-[name]',
    inject: 'body-last',
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
})

afterEach(() => {
  vi.clearAllMocks()
})

type SvgElementStub = {
  id: string
  outerHTML: string
}

function createSvgElementStub(html: string): SvgElementStub {
  const element = {
    id: parseSvgId(html),
    get outerHTML() {
      return html
    },
    set outerHTML(value: string) {
      html = value
      element.id = parseSvgId(value)
    },
  }
  return element
}

function parseSvgId(html: string): string {
  return /id="([^"]+)"/.exec(html)?.[1] ?? ''
}

function createDocumentStub() {
  let mountedSvg: SvgElementStub | null = null
  const body = {
    firstChild: null,
    insertBefore: vi.fn((node: SvgElementStub) => {
      mountedSvg = node
      return node
    }),
  }
  const document = {
    readyState: 'complete',
    body,
    addEventListener: vi.fn(),
    getElementById: vi.fn((id: string) => (mountedSvg?.id === id ? mountedSvg : null)),
    createElement: vi.fn(() => {
      let firstElementChild: SvgElementStub | null = null
      return {
        set innerHTML(html: string) {
          firstElementChild = createSvgElementStub(html)
        },
        get firstElementChild() {
          return firstElementChild
        },
      }
    }),
  }
  return {
    document,
    getMountedSvg: () => mountedSvg,
  }
}

function runRegisterCode(code: string, document: ReturnType<typeof createDocumentStub>['document'], hot = createHotStub()): ReturnType<typeof createHotStub> {
  const executable = code.replaceAll('import.meta.hot', 'hot').replace(/\nexport default \{\}$/, '')
  new Function('window', 'document', 'hot', executable)({}, document, hot)
  return hot
}

function createHotStub() {
  const handlers = new Map<string, (data: unknown) => void>()
  return {
    on: vi.fn((event: string, handler: (data: unknown) => void) => {
      handlers.set(event, handler)
    }),
    emit(event: string, data: unknown) {
      handlers.get(event)?.(data)
    },
  }
}

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
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
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
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
    })

    const content = await renderVirtualModule(ctx, 'register', { isBuild: true, ssr: false })

    expect(content).toContain('svg-icons:update')
    expect(content).toContain('<svg id=\\"__svg__icons__dom__\\"><symbol id=\\"icon-a\\"></symbol></svg>')
    expect(ctx.compiler.getResult).toHaveBeenCalledTimes(1)
  })

  test('register module should mount sprite on first client run', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
    })
    const { document, getMountedSvg } = createDocumentStub()
    const content = await renderVirtualModule(ctx, 'register', { isBuild: false, ssr: false })

    runRegisterCode(content, document)

    expect(document.body.insertBefore).toHaveBeenCalledTimes(1)
    expect(getMountedSvg()?.outerHTML).toBe('<svg id="__svg__icons__dom__"><symbol id="icon-a"></symbol></svg>')
  })

  test('register module should replace mounted sprite in place on hmr update', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
    })
    const { document, getMountedSvg } = createDocumentStub()
    const content = await renderVirtualModule(ctx, 'register', { isBuild: false, ssr: false })
    const hot = runRegisterCode(content, document)

    hot.emit('svg-icons:update', {
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-b"></symbol></svg>',
    })

    expect(document.body.insertBefore).toHaveBeenCalledTimes(1)
    expect(getMountedSvg()?.outerHTML).toBe('<svg id="__svg__icons__dom__"><symbol id="icon-b"></symbol></svg>')
  })

  test('should render ids module in build/dev client path', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
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
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
    })

    const content = await renderVirtualModule(ctx, 'sprite', { isBuild: false, ssr: false })

    expect(content).toContain('export default "<svg')
    expect(content).toContain('id=\\"__svg__icons__dom__\\"')
    expect(content).toContain('<symbol id=\\"icon-a\\"></symbol>')
    expect(ctx.compiler.getResult).toHaveBeenCalledTimes(1)
  })

  test('should render latest sprite module content for ssr after compiler invalidation', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult)
      .mockResolvedValueOnce({
        symbols: ['<symbol id="icon-a"></symbol>'],
        ids: ['icon-a'],
        sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-a"></symbol></svg>',
        iconsByFile: new Map(),
      })
      .mockResolvedValueOnce({
        symbols: ['<symbol id="icon-b"></symbol>'],
        ids: ['icon-b'],
        sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-b"></symbol></svg>',
        iconsByFile: new Map(),
      })

    const first = await renderVirtualModule(ctx, 'sprite', { isBuild: false, ssr: true })
    ctx.compiler.invalidate('/repo/icons/a.svg')
    const second = await renderVirtualModule(ctx, 'sprite', { isBuild: false, ssr: true })

    expect(first).toContain('icon-a')
    expect(second).toContain('icon-b')
    expect(ctx.compiler.invalidate).toHaveBeenCalledWith('/repo/icons/a.svg')
  })
})
