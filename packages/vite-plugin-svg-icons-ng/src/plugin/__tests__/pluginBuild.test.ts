import { afterEach, describe, expect, test, vi } from 'vitest'
import { VIRTUAL_IDS, VIRTUAL_REGISTER } from '../../constants'
import { loadVirtualModuleById, resolveVirtualId } from '../build'
import { renderVirtualModule } from '../virtual'
import type { PluginContext } from '../../types'

vi.mock('../virtual', () => ({
  resolveVirtualTypeFromId: (id: string) => {
    const normalized = id.startsWith('\0') ? id.slice(1) : id
    if (normalized === VIRTUAL_REGISTER) {
      return 'register'
    }
    if (normalized === VIRTUAL_IDS) {
      return 'ids'
    }
    return null
  },
  renderVirtualModule: vi.fn(),
}))

function createPluginContext(): PluginContext {
  return {
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
    },
    compiler: {
      getResult: vi.fn(),
      invalidate: vi.fn(),
      isIconFile: vi.fn(),
    },
  }
}

describe('plugin build helpers', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('resolveVirtualId should normalize only known virtual ids', () => {
    expect(resolveVirtualId(VIRTUAL_REGISTER)).toBe(`\0${VIRTUAL_REGISTER}`)
    expect(resolveVirtualId(`\0${VIRTUAL_IDS}`)).toBe(`\0${VIRTUAL_IDS}`)
    expect(resolveVirtualId('virtual:unknown')).toBeNull()
  })

  test('loadVirtualModuleById should return null for unknown id', async () => {
    const content = await loadVirtualModuleById(createPluginContext(), 'virtual:unknown', false, { ssr: false })
    expect(content).toBeNull()
    expect(renderVirtualModule).not.toHaveBeenCalled()
  })

  test('loadVirtualModuleById should render virtual module in dev client', async () => {
    vi.mocked(renderVirtualModule).mockResolvedValue('export default {}')

    const content = await loadVirtualModuleById(createPluginContext(), VIRTUAL_REGISTER, false, { ssr: false })

    expect(content).toBe('export default {}')
    expect(renderVirtualModule).toHaveBeenCalledTimes(1)
    expect(renderVirtualModule).toHaveBeenCalledWith(expect.anything(), 'register', { isBuild: false, ssr: false })
  })
})
