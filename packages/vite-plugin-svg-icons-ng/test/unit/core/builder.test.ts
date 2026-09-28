import { describe, expect, test } from 'vitest'
import { buildCompileResult } from '../../../src/core/builder'

describe('builder', () => {
  const baseOptions = {
    iconDirs: ['/repo/icons'],
    symbolId: 'icon-[dir]-[name]',
    inject: 'body-last' as const,
    htmlMode: 'script' as const,
    customDomId: '__svg__icons__dom__',
    customDomClass: 'svg-icons__sprite' as string | false,
    customDomStyle: 'position:absolute;width:0;height:0' as string | false,
    strokeOverride: false as const,
    bakerOptions: {},
    failOnError: false,
  }

  function build(options: Partial<typeof baseOptions> = {}) {
    return buildCompileResult([{ file: '/repo/icons/a.svg', id: 'icon-a', symbol: '<symbol id="icon-a"></symbol>', hash: 'hash-a', issues: [] }], {
      ...baseOptions,
      ...options,
    })
  }

  test('should build stable compile result from compiled icons', () => {
    const result = buildCompileResult(
      [
        { file: '/repo/icons/b.svg', id: 'icon-b', symbol: '<symbol id="icon-b"></symbol>', hash: 'hash-b', issues: [] },
        { file: '/repo/icons/a.svg', id: 'icon-a', symbol: '<symbol id="icon-a"></symbol>', hash: 'hash-a', issues: [] },
      ],
      {
        iconDirs: ['/repo/icons'],
        symbolId: 'icon-[dir]-[name]',
        inject: 'body-last',
        htmlMode: 'script',
        customDomId: '__svg__icons__dom__',
        customDomClass: 'svg-icons__sprite',
        customDomStyle: 'position:absolute;width:0;height:0',
        strokeOverride: false,
        bakerOptions: {},
        failOnError: false,
      }
    )

    expect(result.ids).toEqual(['icon-a', 'icon-b'])
    expect(result.symbols).toEqual(['<symbol id="icon-a"></symbol>', '<symbol id="icon-b"></symbol>'])
    expect(result.sprite).toContain('id="__svg__icons__dom__"')
    expect(result.sprite).toContain('class="svg-icons__sprite"')
    expect(result.sprite).toContain('width="0"')
    expect(result.sprite).toContain('height="0"')
    expect(result.sprite).toContain('style="position:absolute;width:0;height:0"')
    expect(result.sprite).toContain('<symbol id="icon-a"></symbol>')
    expect(result.iconsByFile.get('/repo/icons/a.svg')?.id).toBe('icon-a')
  })

  test('should render custom class and style values', () => {
    const result = build({ customDomClass: 'custom-sprite', customDomStyle: 'position: absolute; overflow: hidden' })

    expect(result.sprite).toContain('class="custom-sprite"')
    expect(result.sprite).toContain('style="position: absolute; overflow: hidden"')
  })

  test('should omit class when customDomClass is false', () => {
    const result = build({ customDomClass: false })

    expect(result.sprite).not.toContain(' class=')
    expect(result.sprite).toContain('width="0"')
    expect(result.sprite).toContain('height="0"')
  })

  test('should omit style when customDomStyle is false', () => {
    const result = build({ customDomStyle: false })

    expect(result.sprite).not.toContain(' style=')
    expect(result.sprite).toContain('width="0"')
    expect(result.sprite).toContain('height="0"')
  })

  test('should independently omit class and style while keeping dimensions', () => {
    const result = build({ customDomClass: false, customDomStyle: false })

    expect(result.sprite).not.toContain(' class=')
    expect(result.sprite).not.toContain(' style=')
    expect(result.sprite).toContain('width="0"')
    expect(result.sprite).toContain('height="0"')
  })
})
