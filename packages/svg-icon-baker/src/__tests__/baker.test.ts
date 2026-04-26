import { describe, expect, test } from 'vitest'
import { bakeIcon, bakeIcons } from '../baker.ts'

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
      expect(result.content).toContain('href="#icon-test_p"')
      expect(result.content).not.toContain('xlink:href=')
      expect(result.issues).toEqual([
        expect.objectContaining({
          code: 'unresolved-reference',
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
    const testFn = () => bakeIcon({ content: '<svg></svg>' } as never)
    expect(testFn).toThrow('Property name and content are required.')
  })
  test('content is required', () => {
    const testFn = () => bakeIcon({ name: 'icon-test' } as never)
    expect(testFn).toThrow('Property name and content are required.')
  })
  test('invalid name', () => {
    const testFn = () => bakeIcon({ name: '1 bad name', content: '<svg viewBox="0 0 1 1"/>' })
    expect(testFn).toThrow(/Invalid name/)
  })
  test('svgo parsing failed', () => {
    const testFn = () => bakeIcon({ name: 'icon-test', content: `<div></vid>` })
    expect(testFn).toThrow('Parsing failed.')
  })
  test('viewBox cannot be determined', () => {
    const svg = `<svg><rect height="16" width="32" /></svg>`
    const testFn = () => bakeIcon({ name: 'icon-test', content: svg })
    expect(testFn).toThrow('Cannot determine viewBox.')
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
})

describe('id policy options', () => {
  test('preserves unresolved references when configured', () => {
    const svg = `<svg viewBox="0 0 10 10"><use href="#ghost"/></svg>`
    const result = bakeIcon({ name: 'icon-ghost', content: svg }, { idPolicy: { unresolved: 'preserve' } })

    expect(result.content).toContain('href="#ghost"')
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'unresolved-reference',
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

    expect(result.content).toMatch(/\bid="icon-hash_[a-z0-9]+"/)
    expect(result.content).toMatch(/\bhref="#icon-hash_[a-z0-9]+"/)
  })

  test('prefixes unresolved references with named style by default', () => {
    const svg = `<svg viewBox="0 0 10 10"><use href="#ghost"/></svg>`
    const result = bakeIcon({ name: 'icon-ghost', content: svg }, { optimize: false })

    expect(result.content).toContain('href="#icon-ghost_ghost"')
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'unresolved-reference',
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
})
