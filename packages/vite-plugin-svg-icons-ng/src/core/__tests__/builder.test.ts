import { describe, expect, test } from 'vitest'
import { buildCompileResult } from '../builder'

describe('builder', () => {
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
        strokeOverride: false,
        bakerOptions: {},
        failOnError: false,
      }
    )

    expect(result.ids).toEqual(['icon-a', 'icon-b'])
    expect(result.symbols).toEqual(['<symbol id="icon-a"></symbol>', '<symbol id="icon-b"></symbol>'])
    expect(result.sprite).toContain('id="__svg__icons__dom__"')
    expect(result.sprite).toContain('<symbol id="icon-a"></symbol>')
    expect(result.iconsByFile.get('/repo/icons/a.svg')?.id).toBe('icon-a')
  })
})
