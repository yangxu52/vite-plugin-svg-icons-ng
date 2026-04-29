import { describe, expect, test } from 'vitest'
import { bakeIcon, createBaker } from '../baker.ts'
import { createSvgoConfig, resolveOptions } from '../options.ts'
import type { SvgoPlugins } from '../types.ts'

describe('options module', () => {
  test('resolveOptions uses defaults when input is empty', () => {
    const resolved = resolveOptions()
    expect(resolved.optimize).toBe(true)
    expect(resolved.svgoOptions).toEqual({})
    expect(resolved.idPolicy).toEqual({
      rewrite: true,
      unresolved: 'prefix',
      idStyle: 'named',
      delim: '_',
    })
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
    expect(resolved.idPolicy).toEqual({
      rewrite: true,
      unresolved: 'prefix',
      idStyle: 'named',
      delim: '_',
    })
  })

  test('resolveOptions keeps explicit id policy settings', () => {
    const resolved = resolveOptions({
      idPolicy: {
        rewrite: false,
        idStyle: 'hashed',
        delim: '-',
      },
    })

    expect(resolved.idPolicy).toEqual({
      rewrite: false,
      unresolved: 'prefix',
      idStyle: 'hashed',
      delim: '-',
    })
  })

  test('createSvgoConfig includes safe preset plugins then custom plugins then core plugins', () => {
    const resolved = resolveOptions({
      optimize: true,
      svgoOptions: {
        plugins: [{ name: 'cleanupIds', params: { minify: true, remove: false } }],
      },
    })
    const config = createSvgoConfig(resolved)
    expect(config.plugins).toEqual([
      {
        name: 'preset-default',
        params: {
          overrides: expect.objectContaining({
            cleanupIds: false,
            removeUselessDefs: false,
            removeHiddenElems: false,
            removeUnknownsAndDefaults: false,
            collapseGroups: false,
            mergePaths: false,
            convertShapeToPath: false,
            removeEmptyContainers: false,
          }),
        },
      },
      { name: 'removeTitle' },
      { name: 'removeXMLNS' },
      { name: 'removeXlink' },
      { name: 'removeDimensions' },
    ])
  })

  test('createSvgoConfig omits safe preset plugins when optimize=false', () => {
    const resolved = resolveOptions({ optimize: false })
    const config = createSvgoConfig(resolved)
    expect(config.plugins).toEqual([{ name: 'removeDimensions' }])
  })

  test('createSvgoConfig filters blocked pre-rewrite plugins but keeps string plugins and malformed entries', () => {
    const malformed = { name: 123 } as unknown as SvgoPlugins[number]
    const resolved = resolveOptions({
      optimize: false,
      svgoOptions: {
        plugins: [
          'removeTitle',
          'cleanupIds',
          { name: 'prefixIds', params: { prefix: 'blocked-', delim: '' } },
          { name: 'reusePaths' },
          { name: 'removeEmptyContainers' },
          { name: 'convertOneStopGradients' },
          malformed,
        ] as SvgoPlugins,
      },
    })
    const config = createSvgoConfig(resolved)
    expect(config.plugins).toEqual(['removeTitle', malformed, { name: 'removeDimensions' }])
  })

  test('createSvgoConfig filters user preset-default so blocked overrides cannot be re-enabled', () => {
    const resolved = resolveOptions({
      optimize: false,
      svgoOptions: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                cleanupIds: true,
                mergePaths: true,
              },
            },
          },
          'removeTitle',
        ] as SvgoPlugins,
      },
    })
    const config = createSvgoConfig(resolved)
    expect(config.plugins).toEqual(['removeTitle', { name: 'removeDimensions' }])
  })

  test('createSvgoConfig disables blocked preset-default plugins', () => {
    const resolved = resolveOptions({ optimize: true })
    const config = createSvgoConfig(resolved)
    expect(config.plugins?.[0]).toEqual({
      name: 'preset-default',
      params: {
        overrides: expect.objectContaining({
          cleanupIds: false,
          removeUselessDefs: false,
          removeHiddenElems: false,
          removeUnknownsAndDefaults: false,
          collapseGroups: false,
          mergePaths: false,
          convertShapeToPath: false,
          removeEmptyContainers: false,
        }),
      },
    })
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
    expect(result.content).toMatch(/\bid="icon-core_[^"]+"/)
    expect(result.content).toContain('viewBox="0 0 32 16"')
    expect(result.issues).toEqual([])
  })

  test('idPolicy.rewrite=false skips id rewriting', () => {
    const svg = `<svg viewBox="0 0 10 10"><path id="shape" d="M0 0"/><use href="#shape"/></svg>`
    const result = bakeIcon({ name: 'icon-raw', content: svg }, { optimize: false, idPolicy: { rewrite: false } })

    expect(result.content).toContain('id="shape"')
    expect(result.content).toContain('href="#shape"')
    expect(result.issues).toEqual([])
  })

  test('createBaker resolves config once and reuses it across calls', () => {
    const baker = createBaker({ optimize: false, idPolicy: { delim: '-' } })
    const first = baker.bakeIcon({
      name: 'icon-a',
      content: '<svg viewBox="0 0 10 10"><path id="shape" d="M0 0"/><use href="#shape"/></svg>',
    })
    const second = baker.bakeIcon({
      name: 'icon-b',
      content: '<svg viewBox="0 0 10 10"><path id="shape" d="M0 0"/><use href="#shape"/></svg>',
    })

    expect(first.content).toContain('id="icon-a-shape"')
    expect(second.content).toContain('id="icon-b-shape"')
  })
})
