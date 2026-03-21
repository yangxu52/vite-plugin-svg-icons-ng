import { afterEach, describe, expect, test, vi } from 'vitest'
import { createSvgIconsPlugin } from '../../index'
import { loadVirtualModuleById } from '../build'
import type { Plugin } from 'vite'

vi.mock('../build', () => ({
  resolveVirtualId: vi.fn(),
  loadVirtualModuleById: vi.fn(),
}))

describe('plugin index', () => {
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

  test('should pass ssr flag from vite load options object', async () => {
    vi.mocked(loadVirtualModuleById).mockResolvedValue('export default {}')
    const plugin = createSvgIconsPlugin({
      iconDirs: ['icons'],
    })

    await runLoad(plugin, 'virtual:svg-icons/register', { ssr: false })
    expect(loadVirtualModuleById).toHaveBeenCalledWith(expect.anything(), 'virtual:svg-icons/register', false, { ssr: false })

    await runLoad(plugin, 'virtual:svg-icons/register', { ssr: true })
    expect(loadVirtualModuleById).toHaveBeenLastCalledWith(expect.anything(), 'virtual:svg-icons/register', false, { ssr: true })
  })

  test('should support legacy boolean load option fallback', async () => {
    vi.mocked(loadVirtualModuleById).mockResolvedValue('export default {}')
    const plugin = createSvgIconsPlugin({
      iconDirs: ['icons'],
    })

    await runLoad(plugin, 'virtual:svg-icons/register', true)
    expect(loadVirtualModuleById).toHaveBeenCalledWith(expect.anything(), 'virtual:svg-icons/register', false, true)
  })
})
