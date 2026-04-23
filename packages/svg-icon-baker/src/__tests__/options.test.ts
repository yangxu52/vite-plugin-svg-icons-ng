import { describe, expect, test } from 'vitest'
import { bakeIcon } from '../baker.ts'
import { createSvgoConfig, resolveOptions } from '../options.ts'
import type { SvgoPlugins } from '../types.ts'

describe('options module', () => {
  test('resolveOptions uses defaults when input is empty', () => {
    const resolved = resolveOptions()
    expect(resolved.optimize).toBe(true)
    expect(resolved.svgoOptions).toEqual({})
  })

  test('resolveOptions keeps explicit optimize and svgoOptions', () => {
    const resolved = resolveOptions({
      optimize: false,
      svgoOptions: {
        multipass: true,
        floatPrecision: 2,
      },
    })
    expect(resolved.optimize).toBe(false)
    expect(resolved.svgoOptions).toEqual({
      multipass: true,
      floatPrecision: 2,
    })
  })

  test('createSvgoConfig includes safe preset plugins then custom plugins then core plugins', () => {
    const resolved = resolveOptions({
      optimize: true,
      svgoOptions: {
        plugins: [{ name: 'cleanupIds', params: { minify: true, remove: false } }],
      },
    })
    const config = createSvgoConfig('icon-order', resolved)
    expect(config.plugins).toEqual([
      { name: 'preset-default', params: { overrides: expect.any(Object) } },
      { name: 'removeTitle' },
      { name: 'removeXMLNS' },
      { name: 'removeXlink' },
      { name: 'cleanupIds', params: { minify: true, remove: false } },
      { name: 'removeDimensions' },
      { name: 'prefixIds', params: { prefix: 'icon-order-', delim: '' } },
    ])
  })

  test('createSvgoConfig omits safe preset plugins when optimize=false', () => {
    const resolved = resolveOptions({ optimize: false })
    const config = createSvgoConfig('icon-off', resolved)
    expect(config.plugins).toEqual([{ name: 'removeDimensions' }, { name: 'prefixIds', params: { prefix: 'icon-off-', delim: '' } }])
  })

  test('createSvgoConfig filters prefixIds but keeps string plugins and malformed entries', () => {
    const malformed = { name: 123 } as unknown as SvgoPlugins[number]
    const resolved = resolveOptions({
      optimize: false,
      svgoOptions: {
        plugins: ['cleanupIds', { name: 'prefixIds', params: { prefix: 'blocked-', delim: '' } }, malformed] as SvgoPlugins,
      },
    })
    const config = createSvgoConfig('icon-filter', resolved)
    expect(config.plugins).toEqual([
      'cleanupIds',
      malformed,
      { name: 'removeDimensions' },
      { name: 'prefixIds', params: { prefix: 'icon-filter-', delim: '' } },
    ])
  })
})

describe('options integration', () => {
  test('default optimize removes title/xmlns/xlink in safe mode', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1 1"><title>x</title><use xlink:href="#a"/><path id="a" d="M0 0"/></svg>`
    const result = bakeIcon({ name: 'icon-safe', content: svg })
    expect(result.content).not.toContain('<title>')
    expect(result.content).not.toContain('xmlns=')
    expect(result.content).not.toContain('xmlns:xlink=')
    expect(result.content).not.toContain('xlink:href=')
  })

  test('optimize=false keeps prefix and viewBox core behavior', () => {
    const svg = `<svg width="32" height="16"><defs><linearGradient id="a"><stop offset="0"/></linearGradient></defs><rect fill="url(#a)" width="32" height="16"/></svg>`
    const result = bakeIcon({ name: 'icon-core', content: svg }, { optimize: false })
    expect(result.content).toContain('id="icon-core"')
    expect(result.content).toMatch(/\bid="icon-core-[^"]+"/)
    expect(result.content).toContain('viewBox="0 0 32 16"')
  })
})
