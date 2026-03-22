import { afterEach, describe, expect, test, vi } from 'vitest'
import { createSvgIconsPlugin } from '../index'
import { pluginLoad } from '../plugin/build'
import type { Plugin } from 'vite'

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
    const transformed = await plugin.transformIndexHtml.handler.call({} as never, html, {} as never)
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

    await runLoad(plugin, 'virtual:svg-icons/register', true)
    expect(pluginLoad).toHaveBeenCalledWith(expect.anything(), 'virtual:svg-icons/register', false, true)
  })

  test('should inject sprite into html when dom id does not exist', async () => {
    hoisted.compiler.getResult.mockResolvedValue({
      symbols: ['<symbol id="icon-a"></symbol>'],
      ids: ['icon-a'],
    })
    const plugin = createSvgIconsPlugin({
      iconDirs: ['icons'],
    })

    const html = '<html><body><div id="app"></div></body></html>'
    const transformed = await runTransform(plugin, html)

    expect(transformed).toContain('id="__svg__icons__dom__"')
    expect(transformed).toContain('<symbol id="icon-a"></symbol>')
    expect(hoisted.compiler.getResult).toHaveBeenCalledTimes(1)
  })

  test('should skip html injection when sprite dom id already exists', async () => {
    const plugin = createSvgIconsPlugin({
      iconDirs: ['icons'],
    })
    const html = '<html><body><svg id="__svg__icons__dom__"></svg><div id="app"></div></body></html>'

    const transformed = await runTransform(plugin, html)

    expect(transformed).toBe(html)
    expect(hoisted.compiler.getResult).not.toHaveBeenCalled()
  })
})
