import { describe, expect, test } from 'vitest'
import { parseSvg } from '../xml.ts'
import { collectIds } from '../collect.ts'

describe('collectIds', () => {
  test('collects ids and references from href url begin end and style text', () => {
    const code = `<svg viewBox="0 0 10 10"><style>#a{fill:url(#g)}</style><defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><use href="#a"/><animate id="a" begin="b.begin;c.end-0.5s" end="g.end"/><animate id="b"/><animate id="c"/></svg>`
    const state = collectIds(parseSvg(code))

    expect([...state.definedIds.keys()]).toEqual(['g', 'a', 'b', 'c'])
    expect(state.referenceIds.flatMap((reference) => reference.attributeRefs.flatMap((ref) => ref.targetIds))).toEqual(
      expect.arrayContaining(['a', 'b', 'c', 'g'])
    )
  })

  test('collects xml:id definitions and aria token references', () => {
    const code = `<svg viewBox="0 0 10 10"><title id="titleId">title</title><desc xml:id="descId">desc</desc><g aria-labelledby="titleId descId" aria-describedby="ghost"/></svg>`
    const state = collectIds(parseSvg(code))

    expect([...state.definedIds.keys()]).toEqual(['titleId', 'descId'])
    expect(state.referenceIds.flatMap((reference) => reference.attributeRefs.flatMap((ref) => ref.targetIds))).toEqual(
      expect.arrayContaining(['titleId', 'descId', 'ghost'])
    )
  })
})
