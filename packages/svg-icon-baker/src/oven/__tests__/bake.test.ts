import { describe, expect, test } from 'vitest'
import { bakeSymbol } from '../bake.ts'

describe('bakeSymbol', () => {
  test('builds symbol from one AST pipeline', () => {
    const result = bakeSymbol(
      '<svg width="32px" height="16px"><defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><rect id="shape" fill="url(#g)" width="32" height="16"/></svg>',
      'icon-ast',
      {
        rewrite: true,
        unresolved: 'prefix',
        idStyle: 'named',
        delim: '_',
      }
    )

    expect(result.content.startsWith('<symbol')).toBe(true)
    expect(result.content).toContain('id="icon-ast"')
    expect(result.content).toContain('viewBox="0 0 32 16"')
    expect(result.content).toContain('id="icon-ast_g"')
    expect(result.content).toContain('id="icon-ast_shape"')
    expect(result.content).toContain('fill="url(#icon-ast_g)"')
    expect(result.content).not.toContain('width="32px"')
    expect(result.content).not.toContain('height="16px"')
    expect(result.issues).toEqual([])
  })
})
