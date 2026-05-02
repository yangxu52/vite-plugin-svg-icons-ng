import { afterEach, describe, expect, test, vi } from 'vitest'
import { createCompiler } from '../core/compiler'
import { createSvgIconsPlugin } from '../index'
import { pluginLoad } from '../plugin/build'
import type { Plugin, IndexHtmlTransformHook } from 'vite'

const hoisted = vi.hoisted(() => ({
  compiler: {
    getResult: vi.fn(),
    invalidate: vi.fn(),
    isIconFile: vi.fn(),
  },
}))

vi.mock('../plugin/build', () => ({
  resolveVirtualId: vi.fn(),
  pluginLoad: vi.fn(),
}))

vi.mock('../core/compiler', () => ({
  createCompiler: vi.fn(() => hoisted.compiler),
}))

describe('index entry', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  async function runLoad(plugin: Plugin, id: string, options?: { ssr?: boolean } | boolean): Promise<void> {
    if (!plugin.load) {
      throw new Error('plugin.load is required in this test')
    }
    if (typeof plugin.load === 'function') {
      await plugin.load.call({} as never, id, options as never)
      return
    }
    await plugin.load.handler.call({} as never, id, options as never)
  }

  async function runConfigResolved(plugin: Plugin, root = '/repo/app', command: 'serve' | 'build' = 'serve'): Promise<void> {
    if (!plugin.configResolved) {
      throw new Error('plugin.configResolved is required in this test')
    }
    const config = {
      command,
      root,
      logger: {
        warn: vi.fn(),
      },
    } as never
    if (typeof plugin.configResolved === 'function') {
      await plugin.configResolved.call({} as never, config)
      return
    }
    await plugin.configResolved.handler.call({} as never, config)
  }

  async function runTransform(plugin: Plugin, html: string): Promise<string> {
    if (!plugin.transformIndexHtml) {
      throw new Error('plugin.transformIndexHtml is required in this test')
    }
    if (typeof plugin.transformIndexHtml === 'function') {
      const transformed = await plugin.transformIndexHtml.call({} as never, html, {} as never)
      if (typeof transformed === 'string') {
        return transformed
      }
      if (transformed && typeof transformed === 'object' && 'html' in transformed && typeof transformed.html === 'string') {
        return transformed.html
      }
      return html
    }
    const hook = (plugin.transformIndexHtml as { handler: IndexHtmlTransformHook }).handler
    const transformed = await hook.call({} as never, html, {} as never)
    if (typeof transformed === 'string') {
      return transformed
    }
    if (transformed && typeof transformed === 'object' && 'html' in transformed && typeof transformed.html === 'string') {
      return transformed.html
    }
    return html
  }

  test('should pass ssr flag from vite load options object', async () => {
    vi.mocked(pluginLoad).mockResolvedValue('export default {}')
    const plugin = createSvgIconsPlugin({
      iconDirs: ['icons'],
    })
    await runConfigResolved(plugin)

    await runLoad(plugin, 'virtual:svg-icons/register', { ssr: false })
    expect(pluginLoad).toHaveBeenCalledWith(expect.anything(), 'virtual:svg-icons/register', false, { ssr: false })

    await runLoad(plugin, 'virtual:svg-icons/register', { ssr: true })
    expect(pluginLoad).toHaveBeenLastCalledWith(expect.anything(), 'virtual:svg-icons/register', false, { ssr: true })
  })

  test('should support legacy boolean load option fallback', async () => {
    vi.mocked(pluginLoad).mockResolvedValue('export default {}')
    const plugin = createSvgIconsPlugin({
      iconDirs: ['icons'],
    })
    await runConfigResolved(plugin)

    await runLoad(plugin, 'virtual:svg-icons/register', true)
    expect(pluginLoad).toHaveBeenCalledWith(expect.anything(), 'virtual:svg-icons/register', false, true)
  })

  test('should inject sprite into html when dom id does not exist', async () => {
    hoisted.compiler.getResult.mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
    })
    const plugin = createSvgIconsPlugin({
      iconDirs: ['icons'],
      htmlMode: 'script',
    })
    await runConfigResolved(plugin)

    const html = '<html><body><div id="app"></div></body></html>'
    const transformed = await runTransform(plugin, html)

    expect(transformed).toContain('<script type="module">')
    expect(transformed).toContain('new DOMParser()')
    expect(transformed).toContain('document.createElementNS')
    expect(transformed).toContain('import.meta.hot')
    expect(transformed).not.toContain('<svg id="__svg__icons__dom__"><symbol id="icon-a"></symbol></svg>')
    expect(hoisted.compiler.getResult).toHaveBeenCalledTimes(1)
  })

  test('should inject inline sprite markup when htmlMode is inline', async () => {
    hoisted.compiler.getResult.mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
    })
    const plugin = createSvgIconsPlugin({
      iconDirs: ['icons'],
      htmlMode: 'inline',
    })
    await runConfigResolved(plugin)

    const html = '<html><body><div id="app"></div></body></html>'
    const transformed = await runTransform(plugin, html)

    expect(transformed).toContain('<svg id="__svg__icons__dom__"><symbol id="icon-a"></symbol></svg>')
    expect(transformed).not.toContain('new DOMParser()')
  })

  test('should skip html generation when htmlMode is none', async () => {
    const plugin = createSvgIconsPlugin({
      iconDirs: ['icons'],
      htmlMode: 'none',
    })
    await runConfigResolved(plugin)

    const html = '<html><body><div id="app"></div></body></html>'
    const transformed = await runTransform(plugin, html)

    expect(transformed).toBe(html)
    expect(hoisted.compiler.getResult).not.toHaveBeenCalled()
  })

  test('should escape inline script closing tags when injecting mount script', async () => {
    hoisted.compiler.getResult.mockResolvedValue({
      symbols: ['<symbol id="icon-script"></symbol>'],
      ids: ['icon-script'],
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-script"></symbol></svg></script><script>alert(1)</script>',
      iconsByFile: new Map(),
    })
    const plugin = createSvgIconsPlugin({
      iconDirs: ['icons'],
      htmlMode: 'script',
    })
    await runConfigResolved(plugin)

    const html = '<html><body><div id="app"></div></body></html>'
    const transformed = await runTransform(plugin, html)

    expect(transformed).toContain('\\u003C/script>')
    expect(transformed).not.toContain('</script><script>alert(1)</script>')
  })

  test('should skip html injection when sprite dom id already exists', async () => {
    const plugin = createSvgIconsPlugin({
      iconDirs: ['icons'],
    })
    await runConfigResolved(plugin)
    const html = '<html><body><svg id="__svg__icons__dom__"></svg><div id="app"></div></body></html>'

    const transformed = await runTransform(plugin, html)

    expect(transformed).toBe(html)
    expect(hoisted.compiler.getResult).not.toHaveBeenCalled()
  })

  test('should still inject mount script when htmlMode is script and sprite dom id already exists', async () => {
    hoisted.compiler.getResult.mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
      sprite: '<svg id="__svg__icons__dom__"><symbol id="icon-a"></symbol></svg>',
      iconsByFile: new Map(),
    })
    const plugin = createSvgIconsPlugin({
      iconDirs: ['icons'],
      htmlMode: 'script',
    })
    await runConfigResolved(plugin)
    const html = '<html><body><div id="__svg__icons__dom__"></div><div id="app"></div></body></html>'

    const transformed = await runTransform(plugin, html)

    expect(transformed).toContain('<script type="module">')
    expect(transformed).toContain('new DOMParser()')
    expect(hoisted.compiler.getResult).toHaveBeenCalledTimes(1)
  })

  test('should resolve relative iconDirs from vite root', async () => {
    const plugin = createSvgIconsPlugin({
      iconDirs: ['src/icons'],
    })

    await runConfigResolved(plugin, '/repo/app')

    expect(createCompiler).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          iconDirs: ['/repo/app/src/icons'],
        }),
      })
    )
  })

  test('should register transformIndexHtml as a pre hook for script mode', () => {
    const plugin = createSvgIconsPlugin({
      iconDirs: ['icons'],
      htmlMode: 'script',
    })

    expect(plugin.transformIndexHtml).toMatchObject({
      order: 'pre',
      handler: expect.any(Function),
    })
  })

  test('should register transformIndexHtml with default order for non-script mode', () => {
    const plugin = createSvgIconsPlugin({
      iconDirs: ['icons'],
      htmlMode: 'inline',
    })

    expect(plugin.transformIndexHtml).toMatchObject({
      order: null,
      handler: expect.any(Function),
    })
  })
})
