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
})

afterEach(() => {
  vi.clearAllMocks()
})

type NodeStub = {
  outerHTML: string
  parentNode: ParentNodeStub | ElementStub | null
  cloneNode(deep?: boolean): NodeStub
}

type ParentNodeStub = {
  childNodes: NodeStub[]
  firstChild: NodeStub | null
  insertBefore(node: NodeStub, referenceNode: NodeStub | null): NodeStub
  replaceChild(newChild: NodeStub, oldChild: NodeStub): NodeStub
  removeChild(child: NodeStub): NodeStub
}

type ElementStub = NodeStub & {
  id: string
  nodeName: string
  style: Record<string, string>
  childNodes: NodeStub[]
  firstChild: NodeStub | null
  setAttribute(name: string, value: string): void
  getAttribute(name: string): string | null
  getAttributeNames(): string[]
  removeAttribute(name: string): void
  appendChild(child: NodeStub): NodeStub
  removeChild(child: NodeStub): NodeStub
  querySelector(selector: string): ElementStub | null
}

type ParsedDocumentStub = {
  documentElement: ElementStub | null
}

function createRawNodeStub(html: string): NodeStub {
  return {
    outerHTML: html,
    parentNode: null,
    cloneNode() {
      return createRawNodeStub(html)
    },
  }
}

function createElementStub(tagName: string, attrs: Record<string, string>, children: NodeStub[] = []): ElementStub {
  const attributes = new Map(Object.entries(attrs))
  const element: ElementStub = {
    id: attrs.id ?? '',
    nodeName: tagName,
    parentNode: null,
    style: {},
    childNodes: [...children],
    get firstChild() {
      return this.childNodes[0] ?? null
    },
    get outerHTML() {
      const attrText = Array.from(attributes.entries())
        .map(([name, value]) => ` ${name}="${value}"`)
        .join('')
      return `<${tagName}${attrText}>${this.childNodes.map((child) => child.outerHTML).join('')}</${tagName}>`
    },
    cloneNode(deep = true) {
      const clonedChildren = deep ? this.childNodes.map((child) => child.cloneNode(true)) : []
      return createElementStub(tagName, Object.fromEntries(attributes.entries()), clonedChildren)
    },
    setAttribute(name: string, value: string) {
      attributes.set(name, value)
      if (name === 'id') {
        this.id = value
      }
    },
    getAttribute(name: string) {
      return attributes.get(name) ?? null
    },
    getAttributeNames() {
      return Array.from(attributes.keys())
    },
    removeAttribute(name: string) {
      attributes.delete(name)
      if (name === 'id') {
        this.id = ''
      }
    },
    appendChild(child: NodeStub) {
      this.childNodes.push(child)
      return child
    },
    removeChild(child: NodeStub) {
      const index = this.childNodes.indexOf(child)
      if (index >= 0) {
        this.childNodes.splice(index, 1)
      }
      return child
    },
    querySelector(selector: string) {
      if (selector === 'parsererror') {
        return null
      }
      return null
    },
  }
  for (const child of element.childNodes) {
    child.parentNode = element
  }
  return element
}

function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const match of tag.matchAll(/([^\s=]+)="([^"]*)"/g)) {
    attrs[match[1]] = match[2]
  }
  return attrs
}

function parseSvgDocument(html: string): ParsedDocumentStub {
  const rootMatch = html.match(/^<svg\b([^>]*)>([\s\S]*)<\/svg>$/)
  if (!rootMatch) {
    return { documentElement: null }
  }
  const attrs = parseAttributes(rootMatch[1] ?? '')
  const body = rootMatch[2] ?? ''
  const childNodes = Array.from(body.matchAll(/<symbol\b[\s\S]*?<\/symbol>/g)).map((match) => createRawNodeStub(match[0]))
  return {
    documentElement: createElementStub('svg', attrs, childNodes),
  }
}

function createDOMParserStub() {
  return class DOMParserStub {
    parseFromString(html: string): ParsedDocumentStub {
      return parseSvgDocument(html)
    }
  }
}

function createDocumentStub(existingRoot: ElementStub | null = null) {
  let mountedSvg: ElementStub | null = existingRoot
  const windowStub: Record<string, unknown> = {}
  const bodyChildren = mountedSvg ? [mountedSvg] : []
  const body: ParentNodeStub = {
    childNodes: bodyChildren,
    get firstChild() {
      return this.childNodes[0] ?? null
    },
    insertBefore: vi.fn((node: NodeStub, referenceNode: NodeStub | null) => {
      node.parentNode = body
      if (referenceNode) {
        const index = body.childNodes.indexOf(referenceNode)
        if (index >= 0) {
          body.childNodes.splice(index, 0, node)
        } else {
          body.childNodes.push(node)
        }
      } else {
        body.childNodes.push(node)
      }
      mountedSvg = node as ElementStub
      return node
    }),
    replaceChild: vi.fn((newChild: NodeStub, oldChild: NodeStub) => {
      const index = body.childNodes.indexOf(oldChild)
      if (index >= 0) {
        body.childNodes.splice(index, 1, newChild)
      }
      oldChild.parentNode = null
      newChild.parentNode = body
      if (mountedSvg === oldChild) {
        mountedSvg = newChild as ElementStub
      }
      return oldChild
    }),
    removeChild: vi.fn((child: NodeStub) => {
      const index = body.childNodes.indexOf(child)
      if (index >= 0) {
        body.childNodes.splice(index, 1)
      }
      child.parentNode = null
      if (mountedSvg === child) {
        mountedSvg = null
      }
      return child
    }),
  }
  if (mountedSvg) {
    mountedSvg.parentNode = body
  }

  const document = {
    readyState: 'complete',
    body,
    addEventListener: vi.fn(),
    getElementById: vi.fn((id: string) => (mountedSvg?.id === id ? mountedSvg : null)),
    createElementNS: vi.fn((_ns: string, tagName: string) => createElementStub(tagName, {}, [])),
    importNode: vi.fn((node: NodeStub) => node.cloneNode(true)),
  }

  return {
    document,
    window: windowStub,
    getMountedSvg: () => mountedSvg,
  }
}

function runRegisterCode(
  code: string,
  window: ReturnType<typeof createDocumentStub>['window'],
  document: ReturnType<typeof createDocumentStub>['document'],
  hot = createHotStub()
): ReturnType<typeof createHotStub> {
  const executable = code.replaceAll('import.meta.hot', 'hot').replace(/\nexport default \{\}$/, '')
  const DOMParser = createDOMParserStub()
  new Function('window', 'document', 'hot', 'DOMParser', executable)(window, document, hot, DOMParser)
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
      sprite: '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-a"></symbol></svg>',
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
      sprite: '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
    })

    const content = await renderVirtualModule(ctx, 'register', { isBuild: true, ssr: false })

    expect(content).toContain('svg-icons:update')
    expect(content).toContain('new DOMParser()')
    expect(content).toContain('document.createElementNS')
    expect(ctx.compiler.getResult).toHaveBeenCalledTimes(1)
  })

  test('register module should not depend on htmlMode', async () => {
    const ctx = createPluginContext()
    ctx.options.htmlMode = 'none'
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
      sprite: '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
    })

    const content = await renderVirtualModule(ctx, 'register', { isBuild: false, ssr: false })

    expect(content).toContain('new DOMParser()')
    expect(content).toContain('svg-icons:update')
  })

  test('register module should mount sprite on first client run', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
      sprite: '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
    })
    const { window, document, getMountedSvg } = createDocumentStub()
    const content = await renderVirtualModule(ctx, 'register', { isBuild: false, ssr: false })

    runRegisterCode(content, window, document)

    expect(document.body.insertBefore).toHaveBeenCalledTimes(1)
    expect(getMountedSvg()?.outerHTML).toBe('<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-a"></symbol></svg>')
  })

  test('register module should replace mounted sprite children in place on hmr update', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
    })
    const { window, document, getMountedSvg } = createDocumentStub()
    const content = await renderVirtualModule(ctx, 'register', { isBuild: false, ssr: false })
    const hot = runRegisterCode(content, window, document)

    hot.emit('svg-icons:update', {
      sprite: '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-b"></symbol></svg>',
    })

    expect(document.body.insertBefore).toHaveBeenCalledTimes(1)
    expect(getMountedSvg()?.outerHTML).toBe('<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-b"></symbol></svg>')
  })

  test('register module should preserve symbols after a foreignObject symbol', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      symbols: [
        '<symbol id="icon-foreign"><foreignObject><div xmlns="http://www.w3.org/1999/xhtml"></div></foreignObject></symbol>',
        '<symbol id="icon-after"></symbol>',
      ],
      ids: ['icon-foreign', 'icon-after'],
      sprite:
        '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-foreign"><foreignObject><div xmlns="http://www.w3.org/1999/xhtml"></div></foreignObject></symbol><symbol id="icon-after"></symbol></svg>',
      iconsByFile: new Map(),
    })
    const { window, document, getMountedSvg } = createDocumentStub()
    const content = await renderVirtualModule(ctx, 'register', { isBuild: false, ssr: false })

    runRegisterCode(content, window, document)

    expect(getMountedSvg()?.outerHTML).toContain('<symbol id="icon-foreign">')
    expect(getMountedSvg()?.outerHTML).toContain('<symbol id="icon-after"></symbol>')
  })

  test('register module should replace a non-svg placeholder with svg root and keep hmr updates working', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
      sprite: '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
    })
    const placeholder = createElementStub('div', { id: '__svg__icons__dom__' })
    const { window, document, getMountedSvg } = createDocumentStub(placeholder)
    const content = await renderVirtualModule(ctx, 'register', { isBuild: false, ssr: false })
    const hot = runRegisterCode(content, window, document)

    expect(document.body.replaceChild).toHaveBeenCalledTimes(1)
    expect(document.body.insertBefore).not.toHaveBeenCalled()
    expect(getMountedSvg()?.nodeName).toBe('svg')
    expect(getMountedSvg()?.outerHTML).toBe('<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-a"></symbol></svg>')

    hot.emit('svg-icons:update', {
      sprite: '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-b"></symbol></svg>',
    })

    expect(document.body.replaceChild).toHaveBeenCalledTimes(1)
    expect(getMountedSvg()?.outerHTML).toBe('<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-b"></symbol></svg>')
  })

  test('script runtime should update mounted sprite in place on hmr without register module', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
      sprite: '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
    })
    const { renderInlineMountScript } = await import('../runtime')
    const { window, document, getMountedSvg } = createDocumentStub()
    const hot = createHotStub()
    const script = renderInlineMountScript(
      {
        symbols: ['<symbol id="icon-a"></symbol>'],
        ids: ['icon-a'],
        sprite: '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-a"></symbol></svg>',
        iconsByFile: new Map(),
      },
      ctx.options
    )

    runRegisterCode(script, window, document, hot)
    hot.emit('svg-icons:update', {
      sprite: '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-b"></symbol></svg>',
    })

    expect(hot.on).toHaveBeenCalledTimes(1)
    expect(getMountedSvg()?.outerHTML).toBe('<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-b"></symbol></svg>')
  })

  test('script runtime and register module should share one hmr subscription', async () => {
    const ctx = createPluginContext()
    vi.mocked(ctx.compiler.getResult).mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
      sprite: '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
    })
    const { renderInlineMountScript } = await import('../runtime')
    const script = renderInlineMountScript(
      {
        symbols: ['<symbol id="icon-a"></symbol>'],
        ids: ['icon-a'],
        sprite: '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-a"></symbol></svg>',
        iconsByFile: new Map(),
      },
      ctx.options
    )
    const registerContent = await renderVirtualModule(ctx, 'register', { isBuild: false, ssr: false })
    const { window, document, getMountedSvg } = createDocumentStub()
    const hot = createHotStub()

    runRegisterCode(script, window, document, hot)
    runRegisterCode(registerContent, window, document, hot)
    hot.emit('svg-icons:update', {
      sprite: '<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-b"></symbol></svg>',
    })

    expect(hot.on).toHaveBeenCalledTimes(1)
    expect(document.body.insertBefore).toHaveBeenCalledTimes(1)
    expect(getMountedSvg()?.outerHTML).toBe('<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg"><symbol id="icon-b"></symbol></svg>')
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
