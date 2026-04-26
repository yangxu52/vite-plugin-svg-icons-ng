import { describe, expect, test } from 'vitest'
import { parseSvg } from '../parse.ts'
import { collectSvgState } from '../collect.ts'

describe('collectSvgState', () => {
  test('collects ids and references from href url begin end and style text', () => {
    const code = `<svg viewBox="0 0 10 10"><style>#a{fill:url(#g)}</style><defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><use href="#a"/><animate id="a" begin="b.begin;c.end-0.5s" end="g.end"/><animate id="b"/><animate id="c"/></svg>`
    const state = collectSvgState(parseSvg(code))

    expect([...state.definedIds.keys()]).toEqual(['g', 'a', 'b', 'c'])
    expect(state.referenceIds.flatMap((reference) => reference.attributeRefs.flatMap((ref) => ref.targetIds))).toEqual(
      expect.arrayContaining(['a', 'b', 'c', 'g'])
    )
  })
})
