import { describe, expect, test, vi } from 'vitest'
import type { BakeIssue } from '../../types.ts'
import type { RewriteOptions } from '../types.ts'
import { buildSvg, parseSvg } from '../xml.ts'
import { rewriteIds } from '../rewrite.ts'

const defaultOptions: RewriteOptions = {
  unresolved: 'prefix',
  idStyle: 'minified',
  delim: '_',
}

function runRewrite(code: string, options: RewriteOptions = defaultOptions, rewrite = rewriteIds) {
  const document = parseSvg(code)
  const issues: BakeIssue[] = []
  const idMap = rewrite(document, 'icon', options, issues)
  return {
    code: buildSvg(document),
    idMap,
    issues,
  }
}

describe('rewriteIds', () => {
  test('rewrites href and url references and keeps unused ids', () => {
    const code = `<svg viewBox="0 0 10 10"><defs><linearGradient id="g"><stop offset="0"/></linearGradient><linearGradient id="unused"><stop offset="1"/></linearGradient></defs><rect id="shape" fill="url(#g)"/><use href="#shape"/></svg>`
    const result = runRewrite(code)
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
    const result = runRewrite(code)

    const bId = result.idMap.get('b')
    expect(bId).toBeTruthy()
    expect(result.code).toContain(`end="${bId}.end"`)
    expect(result.code).toContain(`id="${bId}"`)
  })

  test('rewrites multiple smil references in one attribute', () => {
    const code = `<svg viewBox="0 0 10 10"><animate begin="b.begin;c.end-0.5s"/><animate id="b" dur="1s"/><animate id="c" dur="1s"/></svg>`
    const result = runRewrite(code)

    expect(result.code).toContain('begin="icon_a.begin; icon_b.end-0.5s"')
    expect(result.code).toContain('id="icon_a"')
    expect(result.code).toContain('id="icon_b"')
  })

  test('rewrites style tag selectors and url references', () => {
    const code = `<svg viewBox="0 0 10 10"><style>#a{fill:url(#g)}</style><defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><rect id="a" width="10" height="10"/></svg>`
    const result = runRewrite(code)

    expect(result.code).toContain('#icon_b')
    expect(result.code).toContain('url(#icon_a)')
    expect(result.code).toContain('id="icon_b"')
  })

  test('does not rewrite hex colors inside style text', () => {
    const code = `<svg viewBox="0 0 10 10"><style>#a{stroke:#fff;fill:url(#g)}</style><defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><rect id="a" width="10" height="10"/></svg>`
    const result = runRewrite(code)

    expect(result.code).toContain('stroke:#fff')
    expect(result.code).toContain('fill:url(#icon_a)')
    expect(result.code).toContain('#icon_b')
  })

  test('rewrites quoted url references inside style text', () => {
    const code = `<svg viewBox="0 0 10 10"><style>#a{fill:url("#g")}</style><defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><rect id="a" width="10" height="10"/></svg>`
    const result = runRewrite(code)

    expect(result.code).toContain('url(#icon_a)')
    expect(result.code).toContain('#icon_b')
  })

  test('rewrites aria token references and xml:id definitions', () => {
    const code = `<svg viewBox="0 0 10 10"><title id="titleId">title</title><desc xml:id="descId">desc</desc><g aria-labelledby="titleId descId" aria-describedby="ghost"/></svg>`
    const result = runRewrite(code, { unresolved: 'prefix', idStyle: 'named', delim: '_' })

    expect(result.code).toContain('id="icon_titleId"')
    expect(result.code).toContain('xml:id="icon_descId"')
    expect(result.code).toContain('aria-labelledby="icon_titleId icon_descId"')
    expect(result.code).toContain('aria-describedby="icon_ghost"')
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'ResolveReferenceFailed',
        targetId: 'ghost',
      }),
    ])
  })

  test('issues and prefixes unresolved href by default named style', () => {
    const code = `<svg viewBox="0 0 10 10"><use href="#ghost"/></svg>`
    const result = runRewrite(code, { unresolved: 'prefix', idStyle: 'named', delim: '_' })

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
    const result = runRewrite(code)

    expect(result.code).toContain('id="icon_a"')
    expect(result.code).toContain('href="#icon_b"')
    expect(result.code.match(/href="#icon_b"/g)).toHaveLength(2)
  })

  test('prefixes unresolved href with hashed style using symbol namespace', () => {
    const code = `<svg viewBox="0 0 10 10"><use href="#ghost"/></svg>`
    const result = runRewrite(code, { unresolved: 'prefix', idStyle: 'hashed', delim: '_' })

    expect(result.code).toMatch(/href="#icon_[0-9A-Za-z]+"/)
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'ResolveReferenceFailed',
        targetId: 'ghost',
      }),
    ])
  })

  test('supports explicit delim override across generated ids', () => {
    const code = `<svg viewBox="0 0 10 10"><path id="shape" d="M0 0"/><use href="#shape"/><use href="#ghost"/></svg>`
    const result = runRewrite(code)

    expect(result.code).toContain('id="icon_a"')
    expect(result.code).toContain('href="#icon_a"')
    expect(result.code).toContain('href="#icon_b"')
  })

  test('preserves unresolved href when configured', () => {
    const code = `<svg viewBox="0 0 10 10"><use href="#ghost"/></svg>`
    const result = runRewrite(code, { unresolved: 'preserve', idStyle: 'named', delim: '_' })

    expect(result.code).toContain('href="#ghost"')
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'ResolveReferenceFailed',
        targetId: 'ghost',
      }),
    ])
  })

  test('reports duplicate definitions and keeps only the first rewritten definition', () => {
    const code = `<svg viewBox="0 0 10 10"><defs><linearGradient id="dup"><stop offset="0"/></linearGradient><linearGradient id="dup"><stop offset="1"/></linearGradient></defs><rect fill="url(#dup)"/></svg>`
    const result = runRewrite(code, { unresolved: 'prefix', idStyle: 'named', delim: '_' })

    expect(result.code).toContain('id="icon_dup"')
    expect(result.code).toContain('fill="url(#icon_dup)"')
    expect(result.code.match(/id="icon_dup"/g)).toHaveLength(1)
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'DetectDefinitionDuplicate',
        targetId: 'dup',
      }),
    ])
  })

  test('reports parse style failure and preserves original style content', async () => {
    vi.resetModules()
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
      const { rewriteIds: rewriteIdsWithMock } = await import('../rewrite.ts')
      const code = `<svg viewBox="0 0 10 10"><style>#a{fill:url(#g)}</style><defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><rect id="a" width="10" height="10"/></svg>`
      const result = runRewrite(code, { unresolved: 'prefix', idStyle: 'named', delim: '_' }, rewriteIdsWithMock)

      expect(result.code).toContain('<style>#a{fill:url(#g)}</style>')
      expect(result.code).toContain('id="icon_g"')
      expect(result.code).toContain('id="icon_a"')
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
