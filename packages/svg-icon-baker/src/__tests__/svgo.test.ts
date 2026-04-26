import { describe, expect, test } from 'vitest'
import { bakeIcon } from '../baker.ts'

const options = { optimize: false }

describe('plugin: prefixId SMIL', () => {
  describe('without offsets', () => {
    const svg = `<svg viewBox="0 0 32 32"><animate id="a" begin="b.end" /><animate id="b" begin="a.begin" /></svg>`
    const result = bakeIcon({ name: 'icon-test', content: svg }, options)
    test('x.end', () => {
      expect(result.content).toContain('begin="icon-test_b.end"')
    })
    test('x.begin', () => {
      expect(result.content).toContain('begin="icon-test_a.begin"')
    })
  })
  describe('with offsets: x.end-0.5s', () => {
    const svg = `<svg viewBox="0 0 32 32"><animate id="a" begin="b.end-0.5s" /><animate id="b" begin="a.begin+0.1s" /></svg>`
    const result = bakeIcon({ name: 'icon-test', content: svg }, options)
    test('x.end-0.5s', () => {
      expect(result.content).toContain('begin="icon-test_b.end-0.5s"')
    })
    test('x.begin+0.1s', () => {
      expect(result.content).toContain('begin="icon-test_a.begin+0.1s"')
    })
  })
  describe('mix with offsets and without ', () => {
    const svg = `<svg viewBox="0 0 32 32"><animate id="a" begin="b.begin;b.end-0.5s" /><animate id="b" begin="a.end;a.begin+0.1s" /></svg>`
    const result = bakeIcon({ name: 'icon-test', content: svg }, options)
    test('x.begin;x.end-0.5s', () => {
      expect(result.content).toContain('begin="icon-test_b.begin; icon-test_b.end-0.5s"')
    })
    test('x.end;x.begin+0.1s', () => {
      expect(result.content).toContain('begin="icon-test_a.end; icon-test_a.begin+0.1s"')
    })
  })
})
