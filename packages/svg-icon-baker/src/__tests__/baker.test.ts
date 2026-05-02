import { describe, expect, test, vi } from 'vitest'
import { bakeIcon, bakeIcons, createBaker } from '../baker.ts'
import { BakeError } from '../types.ts'

describe('feature tests', () => {
  const svg = `\uFEFF<?xml version="1.0" encoding="UTF-8"?>
                 <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32px" height="16px">
                   <defs>
                     <clipPath id="clipA"><rect x="0" y="0" width="24" height="12"/></clipPath>
                     <mask id="maskA"><rect x="0" y="0" width="24" height="24" fill="#fff"/></mask>
                     <filter id="filterA"><feGaussianBlur stdDeviation="2"/></filter>
                     <pattern id="patternA" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4"/></pattern>
                     <marker id="markerA" markerWidth="4" markerHeight="4"><path d="M0,0 L4,2 L0,4 z"/></marker><path id="p1" d="M0 0L24 0"/>
                     <linearGradient id="grad1"><stop offset="0"/></linearGradient>
                   </defs>
                   <rect fill="url(#grad1)" x="0" y="0" width="24" height="24"/>
                   <rect clip-path="url(#clipA)" x="0" y="0" width="24" height="24"/>
                   <rect mask="url(#maskA)" x="0" y="0" width="24" height="24"/>
                   <rect filter="url(#filterA)" x="0" y="0" width="24" height="24"/>
                   <rect fill="url(#patternA)" x="0" y="0" width="24" height="24"/>
                   <path d="M0 12L24 12" marker-start="url(#markerA)" marker-end="url(#markerA)"/>
                   <use href="#p" x="0" y="0"/>
                   <use xlink:href="#p" x="0" y="2"/>
                 </svg>`
  const result = bakeIcon({ name: 'icon-test', content: svg })
  describe('complete structure ', () => {
    test('complete symbol start tag', () => {
      expect(result.content.startsWith('<symbol')).toBe(true)
    })
    test('complete symbol end tag', () => {
      expect(result.content.endsWith('</symbol>')).toBe(true)
    })
  })
  describe('prefix ids and references', () => {
    test('rename symbol id', () => {
      expect(result.content).toContain('id="icon-test"')
    })
    test('prefix internal id', () => {
      expect(result.content).toMatch(/\bid="icon-test_[^"]*"/)
    })
    test('prefix url reference', () => {
      expect(result.content).toMatch(/\burl\(#icon-test_[^"]*\)/)
      expect(result.content).not.toMatch(/\burl\(#(?!icon-test_)[^")]*\)/)
    })
    test('use href instead of xlink:href and unresolved href is reported', () => {
      expect(result.content).toContain('href="#icon-test_h"')
      expect(result.content).not.toContain('xlink:href=')
      expect(result.issues).toEqual([
        expect.objectContaining({
          code: 'ResolveReferenceFailed',
          targetId: 'p',
        }),
      ])
    })
  })
  describe('infers viewBox from width/height and removes width/height', () => {
    test('infers viewBox from width/height', () => {
      expect(result.content).toContain('viewBox="0 0 32 16"')
    })
    test('not contain width/height attributes', () => {
      expect(result.content).not.toContain('width="32px"')
      expect(result.content).not.toContain('height="16px"')
    })
  })
  describe('removes xml/comment declaration', () => {
    test('not contain BOM', () => {
      expect(result.content).not.toContain('\uFEFF')
    })
    test('not contain xml declaration', () => {
      expect(result.content).not.toContain('<?xml')
    })
    test('not contain comment', () => {
      expect(result.content).not.toContain('<!--')
    })
  })
})

describe('root attribute preservation', () => {
  test('keep root fill and replace root id when converting svg to symbol', () => {
    const svg = `<svg id="legacy-root" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 1v8"/></svg>`
    const result = bakeIcon({ name: 'icon-exit', content: svg })
    expect(result.content).toContain('<symbol')
    expect(result.content).toContain('id="icon-exit"')
    expect(result.content).not.toContain('id="legacy-root"')
    expect(result.content).toContain('viewBox="0 0 18 18"')
    expect(result.content).toContain('fill="none"')
    expect(result.issues).toEqual([])
  })
})

describe('svg preamble handling', () => {
  test('accepts xml declaration comments and doctype before svg root', () => {
    const svg = `\uFEFF
      <?xml version="1.0" encoding="UTF-8"?>
      <!-- exported by tooling -->
      <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z"/></svg>`
    const result = bakeIcon({ name: 'icon-preamble', content: svg })
    expect(result.content).toContain('<symbol')
    expect(result.content).toContain('id="icon-preamble"')
    expect(result.content).toContain('viewBox="0 0 24 24"')
    expect(result.content).not.toContain('<?xml')
    expect(result.content).not.toContain('<!--')
    expect(result.content).not.toContain('<!DOCTYPE')
    expect(result.issues).toEqual([])
  })
})

describe('validation tests', () => {
  test('name is required', () => {
    try {
      bakeIcon({ content: '<svg></svg>' } as never)
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(BakeError)
      expect((error as BakeError).code).toBe('ValidateSourceInvalid')
      expect((error as Error).message).toBe('Property name and content are required.')
    }
  })
  test('content is required', () => {
    try {
      bakeIcon({ name: 'icon-test' } as never)
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(BakeError)
      expect((error as BakeError).code).toBe('ValidateSourceInvalid')
      expect((error as Error).message).toBe('Property name and content are required.')
    }
  })
  test('invalid name', () => {
    try {
      bakeIcon({ name: '1 bad name', content: '<svg viewBox="0 0 1 1"/>' })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(BakeError)
      expect((error as BakeError).code).toBe('ValidateNameInvalid')
      expect((error as Error).message).toBe('Invalid name. Use letters, numbers, dash, or underscore, starting with a letter.')
    }
  })
  test('svg root validation failed', () => {
    try {
      bakeIcon({ name: 'icon-test', content: `<div></vid>` })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(BakeError)
      expect((error as BakeError).code).toBe('ValidateSvgRootInvalid')
      expect((error as Error).message).toBe('Input must start with an <svg> root element.')
    }
  })
  test('viewBox cannot be determined', () => {
    const svg = `<svg><rect height="16" width="32" /></svg>`
    try {
      bakeIcon({ name: 'icon-test', content: svg })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(BakeError)
      expect((error as BakeError).code).toBe('ResolveViewBoxFailed')
      expect((error as Error).message).toBe('Cannot determine viewBox. Provide an SVG with viewBox or width/height attributes.')
    }
  })
  test('id rewrite parse failure is reported as BakeError with cause', () => {
    const svg = `<svg viewBox="0 0 1 1"><style>#a{fill:red}</style><path id="a"`
    try {
      bakeIcon({ name: 'icon-test', content: svg }, { optimize: false })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(BakeError)
      expect((error as BakeError).code).toBe('OptimizeSvgFailed')
      expect((error as Error).message).toBe('SVGO optimization failed.')
      expect((error as BakeError).cause).toBeDefined()
    }
  })
  test('svgo optimization failure is reported as BakeError with cause', () => {
    const svg = `<svg viewBox="0 0 1 1"><path d="M0 0"/></svg>`
    const plugin = {
      name: 'boom',
      fn: () => ({
        root: {
          enter() {
            throw new Error('boom')
          },
        },
      }),
    }
    try {
      bakeIcon({ name: 'icon-test', content: svg }, { svgoOptions: { plugins: [plugin] } })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(BakeError)
      expect((error as BakeError).code).toBe('OptimizeSvgFailed')
      expect((error as Error).message).toBe('SVGO optimization failed.')
      expect((error as BakeError).cause).toBeInstanceOf(Error)
    }
  })

  test('optimization runs before id rewrite', async () => {
    const calls: string[] = []
    vi.doMock('../oven/rewrite.ts', async () => {
      const actual = await vi.importActual<typeof import('../oven/rewrite.ts')>('../oven/rewrite.ts')
      return {
        ...actual,
        rewriteIds: (
          root: Parameters<typeof actual.rewriteIds>[0],
          prefix: string,
          options: Parameters<typeof actual.rewriteIds>[2],
          issues: Parameters<typeof actual.rewriteIds>[3]
        ) => {
          calls.push('rewrite')
          return actual.rewriteIds(root, prefix, options, issues)
        },
      }
    })

    try {
      vi.resetModules()
      const { bakeIcon: bakeIconWithMock } = await import('../baker.ts')
      bakeIconWithMock(
        {
          name: 'icon-order',
          content: '<svg viewBox="0 0 10 10"><path id="shape" d="M0 0"/><use href="#shape"/></svg>',
        },
        {
          svgoOptions: {
            plugins: [
              {
                name: 'track-order',
                fn: () => ({
                  root: {
                    enter() {
                      calls.push('optimize')
                    },
                  },
                }),
              },
            ],
          },
        }
      )

      expect(calls).toEqual(['optimize', 'rewrite'])
    } finally {
      vi.doUnmock('../oven/rewrite.ts')
      vi.resetModules()
    }
  })
})

describe('batch process tests', () => {
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 16"><title>test</title><rect id="r" width="32" height="16"/></svg>`
  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 16"><title>test</title><rect id="r" width="32" height="16"/></svg>`
  const sources = [
    { name: 'icon1', content: svg1 },
    { name: 'icon2', content: svg2 },
  ]
  test('batch process', () => {
    const testFn = () => bakeIcons(sources)
    expect(testFn).not.toThrow('Error')
  })

  test('returns issues independently per icon', () => {
    const results = bakeIcons(
      [
        { name: 'icon-clean', content: `<svg viewBox="0 0 10 10"><path id="shape" d="M0 0"/></svg>` },
        { name: 'icon-warn', content: `<svg viewBox="0 0 10 10"><use href="#ghost"/></svg>` },
      ],
      { optimize: false }
    )

    expect(results[0].issues).toEqual([])
    expect(results[1].issues).toEqual([
      expect.objectContaining({
        code: 'ResolveReferenceFailed',
        targetId: 'ghost',
      }),
    ])
  })
})

describe('baker instance', () => {
  test('reuses one resolved configuration across multiple conversions', () => {
    const baker = createBaker({ optimize: false, idPolicy: { idStyle: 'named', delim: '-' } })

    const first = baker.bakeIcon({
      name: 'icon-first',
      content: '<svg viewBox="0 0 10 10"><path id="shape" d="M0 0"/><use href="#shape"/></svg>',
    })
    const second = baker.bakeIcon({
      name: 'icon-second',
      content: '<svg viewBox="0 0 10 10"><path id="shape" d="M0 0"/><use href="#shape"/></svg>',
    })

    expect(first.content).toContain('id="icon-first-shape"')
    expect(first.content).toContain('href="#icon-first-shape"')
    expect(second.content).toContain('id="icon-second-shape"')
    expect(second.content).toContain('href="#icon-second-shape"')
  })

  test('batch api on instance matches top-level behavior', () => {
    const baker = createBaker({ optimize: false })
    const results = baker.bakeIcons([
      { name: 'icon-a', content: '<svg viewBox="0 0 10 10"><path id="a" d="M0 0"/></svg>' },
      { name: 'icon-b', content: '<svg viewBox="0 0 10 10"><use href="#ghost"/></svg>' },
    ])

    expect(results[0].name).toBe('icon-a')
    expect(results[0].issues).toEqual([])
    expect(results[1].name).toBe('icon-b')
    expect(results[1].issues).toEqual([
      expect.objectContaining({
        code: 'ResolveReferenceFailed',
        targetId: 'ghost',
      }),
    ])
  })
})

describe('id policy options', () => {
  test('preserves unresolved references when configured', () => {
    const svg = `<svg viewBox="0 0 10 10"><use href="#ghost"/></svg>`
    const result = bakeIcon({ name: 'icon-ghost', content: svg }, { idPolicy: { unresolved: 'preserve' } })

    expect(result.content).toContain('href="#ghost"')
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'ResolveReferenceFailed',
        targetId: 'ghost',
      }),
    ])
  })

  test('supports minified id style', () => {
    const svg = `<svg viewBox="0 0 10 10"><path id="shape" d="M0 0"/><use href="#shape"/></svg>`
    const result = bakeIcon({ name: 'icon-mini', content: svg }, { optimize: false, idPolicy: { idStyle: 'minified' } })

    expect(result.content).toContain('id="icon-mini_a"')
    expect(result.content).toContain('href="#icon-mini_a"')
  })

  test('supports hashed id style', () => {
    const svg = `<svg viewBox="0 0 10 10"><path id="shape" d="M0 0"/><use href="#shape"/></svg>`
    const result = bakeIcon({ name: 'icon-hash', content: svg }, { optimize: false, idPolicy: { idStyle: 'hashed' } })

    expect(result.content).toMatch(/\bid="icon-hash_[0-9A-Za-z]+"/)
    expect(result.content).toMatch(/\bhref="#icon-hash_[0-9A-Za-z]+"/)
  })

  test('prefixes unresolved references with minified style by default', () => {
    const svg = `<svg viewBox="0 0 10 10"><use href="#ghost"/></svg>`
    const result = bakeIcon({ name: 'icon-ghost', content: svg }, { optimize: false })

    expect(result.content).toContain('href="#icon-ghost_a"')
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'ResolveReferenceFailed',
        targetId: 'ghost',
      }),
    ])
  })

  test('supports explicit delim override for named style', () => {
    const svg = `<svg viewBox="0 0 10 10"><path id="shape" d="M0 0"/><use href="#shape"/></svg>`
    const result = bakeIcon({ name: 'icon-name', content: svg }, { optimize: false, idPolicy: { idStyle: 'named', delim: '-' } })

    expect(result.content).toContain('id="icon-name-shape"')
    expect(result.content).toContain('href="#icon-name-shape"')
  })

  test('reports parse style failure and preserves original style content in baked output', async () => {
    vi.resetModules()
    vi.doUnmock('../oven/rewrite.ts')
    vi.doMock('css-tree', async () => {
      const actual = await vi.importActual<typeof import('css-tree')>('css-tree')
      return {
        ...actual,
        parse: () => {
          throw new Error('bad css')
        },
      }
    })

    try {
      const { bakeIcon: bakeIconWithMock } = await import('../baker.ts')
      const svg = `<svg viewBox="0 0 10 10"><style>#a{fill:url(#g)}</style><defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><rect id="a" width="10" height="10"/></svg>`
      const result = bakeIconWithMock({ name: 'icon-style', content: svg }, { optimize: false })

      expect(result.content).toContain('<style>#a{fill:url(#g)}</style>')
      expect(result.content).toContain('id="icon-style_a"')
      expect(result.content).toContain('id="icon-style_b"')
      expect(result.issues).toEqual([
        expect.objectContaining({
          code: 'ParseStyleFailed',
        }),
      ])
    } finally {
      vi.doUnmock('css-tree')
      vi.resetModules()
    }
  })
})
