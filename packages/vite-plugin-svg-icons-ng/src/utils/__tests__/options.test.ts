import { describe, expect, test } from 'vitest'
import { ERR_CUSTOM_DOM_ID_SYNTAX, ERR_ICON_DIRS_REQUIRED, ERR_SYMBOL_ID_NO_NAME, ERR_SYMBOL_ID_SYNTAX } from '../../constants'
import { resolveOptions, validateOptions } from '../options'

describe('Test ValidateOption', () => {
  const template = { iconDirs: ['icons'], symbolId: 'icon-[dir]-[name]', customDomId: '__svg__icons__dom__' } as {
    iconDirs: string[]
    symbolId: string
    customDomId: string
  }

  test('right option', () => {
    const options = { ...template }

    expect(() => {
      validateOptions(options)
    }).not.toThrow()
  })

  describe('option: iconDirs', () => {
    test('iconDirs is required', () => {
      const options = { ...template, iconDirs: [] }

      expect(() => {
        validateOptions(options)
      }).toThrow(ERR_ICON_DIRS_REQUIRED)
    })
  })
  describe('option: symbolId', () => {
    test('SymbolId must contain [name] string!', () => {
      const options = { ...template, symbolId: 'icon-[dir]' }

      expect(() => {
        validateOptions(options)
      }).toThrow(ERR_SYMBOL_ID_NO_NAME)
    })

    test('symbolId must comply with the syntax', () => {
      const options = { ...template, symbolId: '0-[name]' }

      expect(() => {
        validateOptions(options)
      }).toThrow(ERR_SYMBOL_ID_SYNTAX)
    })
  })

  describe('option: customDomId', () => {
    test('customDomId must comply with the syntax', () => {
      const options = { ...template, customDomId: '0-[name]' }

      expect(() => {
        validateOptions(options)
      }).toThrow(ERR_CUSTOM_DOM_ID_SYNTAX)
    })
  })

  describe('option: failOnError', () => {
    test('failOnError defaults to false', () => {
      const options = resolveOptions({
        iconDirs: ['icons'],
      })
      expect(options.failOnError).toBe(false)
    })

    test('should resolve explicit failOnError=true', () => {
      const options = resolveOptions({
        iconDirs: ['icons'],
        failOnError: true,
      })
      expect(options.failOnError).toBe(true)
    })
  })
})
