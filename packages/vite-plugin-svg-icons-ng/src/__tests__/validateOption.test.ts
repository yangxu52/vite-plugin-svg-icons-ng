import { describe, expect, test } from 'vitest'
import { validate } from '../core'
import { ERR_CUSTOM_DOM_ID_SYNTAX, ERR_ICON_DIRS_REQUIRED, ERR_SYMBOL_ID_NO_NAME, ERR_SYMBOL_ID_SYNTAX } from '../constants'

describe('Test ValidateOption', () => {
  const template = { iconDirs: ['icons'], symbolId: 'icon-[dir]-[name]', customDomId: '__svg__icons__dom__' } as any

  test('right option', () => {
    const options = { ...template }

    expect(() => {
      validate(options)
    }).not.toThrow()
  })

  describe('option: iconDirs', () => {
    test('iconDirs is required', () => {
      const options = { ...template, iconDirs: [] }

      expect(() => {
        validate(options)
      }).toThrowError(ERR_ICON_DIRS_REQUIRED)
    })
  })
  describe('option: symbolId', () => {
    test('SymbolId must contain [name] string!', () => {
      const options = { ...template, symbolId: 'icon-[dir]' }

      expect(() => {
        validate(options)
      }).toThrowError(ERR_SYMBOL_ID_NO_NAME)
    })

    test('symbolId must comply with the syntax', () => {
      const options = { ...template, symbolId: '0-[name]' }

      expect(() => {
        validate(options)
      }).toThrowError(ERR_SYMBOL_ID_SYNTAX)
    })
  })

  describe('option: customDomId', () => {
    test('customDomId must comply with the syntax', () => {
      const options = { ...template, customDomId: '0-[name]' }

      expect(() => {
        validate(options)
      }).toThrowError(ERR_CUSTOM_DOM_ID_SYNTAX)
    })
  })
})
