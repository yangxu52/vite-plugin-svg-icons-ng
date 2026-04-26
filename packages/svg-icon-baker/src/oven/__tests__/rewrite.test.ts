import { describe, expect, test } from 'vitest'
import { rewriteSvgIds } from '../rewrite.ts'

describe('rewriteSvgIds', () => {
  test('rewrites href and url references and keeps unused ids', () => {
    const code = `<svg viewBox="0 0 10 10"><defs><linearGradient id="g"><stop offset="0"/></linearGradient><linearGradient id="unused"><stop offset="1"/></linearGradient></defs><rect id="shape" fill="url(#g)"/><use href="#shape"/></svg>`
    const result = rewriteSvgIds(code, 'icon', { unresolved: 'prefix', idStyle: 'minified', delim: '_' })
    const gId = result.idMap.get('g')
    const shapeId = result.idMap.get('shape')

    expect(gId).toBeTruthy()
    expect(shapeId).toBeTruthy()
    expect(result.code).toContain(`id="${gId}"`)
    expect(result.code).toContain(`id="${shapeId}"`)
    expect(result.code).toContain(`fill="url(#${gId})"`)
    expect(result.code).toContain(`href="#${shapeId}"`)
    expect(result.code).toContain('id="icon_c"')
  })

  test('keeps end-only smil references consistent', () => {
    const code = `<svg viewBox="0 0 10 10"><animate id="a" end="b.end"/><animate id="b" dur="1s"/></svg>`
    const result = rewriteSvgIds(code, 'icon', { unresolved: 'prefix', idStyle: 'minified', delim: '_' })

    const bId = result.idMap.get('b')
    expect(bId).toBeTruthy()
    expect(result.code).toContain(`end="${bId}.end"`)
    expect(result.code).toContain(`id="${bId}"`)
  })

  test('rewrites multiple smil references in one attribute', () => {
    const code = `<svg viewBox="0 0 10 10"><animate begin="b.begin;c.end-0.5s"/><animate id="b" dur="1s"/><animate id="c" dur="1s"/></svg>`
    const result = rewriteSvgIds(code, 'icon', { unresolved: 'prefix', idStyle: 'minified', delim: '_' })

    expect(result.code).toContain('begin="icon_a.begin; icon_b.end-0.5s"')
    expect(result.code).toContain('id="icon_a"')
    expect(result.code).toContain('id="icon_b"')
  })

  test('rewrites style tag selectors and url references', () => {
    const code = `<svg viewBox="0 0 10 10"><style>#a{fill:url(#g)}</style><defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><rect id="a" width="10" height="10"/></svg>`
    const result = rewriteSvgIds(code, 'icon', { unresolved: 'prefix', idStyle: 'minified', delim: '_' })

    expect(result.code).toContain('#icon_b')
    expect(result.code).toContain('url(#icon_a)')
    expect(result.code).toContain('id="icon_b"')
  })

  test('does not rewrite hex colors inside style text', () => {
    const code = `<svg viewBox="0 0 10 10"><style>#a{stroke:#fff;fill:url(#g)}</style><defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><rect id="a" width="10" height="10"/></svg>`
    const result = rewriteSvgIds(code, 'icon', { unresolved: 'prefix', idStyle: 'minified', delim: '_' })

    expect(result.code).toContain('stroke:#fff')
    expect(result.code).toContain('fill:url(#icon_a)')
    expect(result.code).toContain('#icon_b')
  })

  test('rewrites quoted url references inside style text', () => {
    const code = `<svg viewBox="0 0 10 10"><style>#a{fill:url("#g")}</style><defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><rect id="a" width="10" height="10"/></svg>`
    const result = rewriteSvgIds(code, 'icon', { unresolved: 'prefix', idStyle: 'minified', delim: '_' })

    expect(result.code).toContain('url(#icon_a)')
    expect(result.code).toContain('#icon_b')
  })

  test('issues and prefixes unresolved href by default named style', () => {
    const code = `<svg viewBox="0 0 10 10"><use href="#ghost"/></svg>`
    const result = rewriteSvgIds(code, 'icon', { unresolved: 'prefix', idStyle: 'named', delim: '_' })

    expect(result.code).toContain('href="#icon_ghost"')
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'ResolveReferenceFailed',
        targetId: 'ghost',
      }),
    ])
  })

  test('prefixes unresolved href with minified style using generated namespace ids', () => {
    const code = `<svg viewBox="0 0 10 10"><path id="shape" d="M0 0"/><use href="#ghost"/><use href="#ghost"/></svg>`
    const result = rewriteSvgIds(code, 'icon', { unresolved: 'prefix', idStyle: 'minified', delim: '_' })

    expect(result.code).toContain('id="icon_a"')
    expect(result.code).toContain('href="#icon_b"')
    expect(result.code.match(/href="#icon_b"/g)).toHaveLength(2)
  })

  test('prefixes unresolved href with hashed style using symbol namespace', () => {
    const code = `<svg viewBox="0 0 10 10"><use href="#ghost"/></svg>`
    const result = rewriteSvgIds(code, 'icon', { unresolved: 'prefix', idStyle: 'hashed', delim: '_' })

    expect(result.code).toMatch(/href="#icon_[a-z0-9]+"/)
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'ResolveReferenceFailed',
        targetId: 'ghost',
      }),
    ])
  })

  test('supports explicit delim override across generated ids', () => {
    const code = `<svg viewBox="0 0 10 10"><path id="shape" d="M0 0"/><use href="#shape"/><use href="#ghost"/></svg>`
    const result = rewriteSvgIds(code, 'icon', { unresolved: 'prefix', idStyle: 'minified', delim: '_' })

    expect(result.code).toContain('id="icon_a"')
    expect(result.code).toContain('href="#icon_a"')
    expect(result.code).toContain('href="#icon_b"')
  })

  test('preserves unresolved href when configured', () => {
    const code = `<svg viewBox="0 0 10 10"><use href="#ghost"/></svg>`
    const result = rewriteSvgIds(code, 'icon', { unresolved: 'preserve', idStyle: 'named', delim: '_' })

    expect(result.code).toContain('href="#ghost"')
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'ResolveReferenceFailed',
        targetId: 'ghost',
      }),
    ])
  })
})
