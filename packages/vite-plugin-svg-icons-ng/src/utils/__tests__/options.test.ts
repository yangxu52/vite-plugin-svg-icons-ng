import { describe, expect, test } from 'vitest'
import { ERR_CUSTOM_DOM_ID_SYNTAX, ERR_HTML_MODE, ERR_ICON_DIRS_REQUIRED, ERR_SYMBOL_ID_NO_NAME, ERR_SYMBOL_ID_SYNTAX } from '../../constants'
import { resolveOptions, resolveOptionsWithContext, validateOptions } from '../options'

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

    test('relative iconDirs should resolve from vite root', () => {
      const options = resolveOptionsWithContext(
        {
          iconDirs: ['src/icons', '/shared/icons'],
        },
        { root: '/repo/app' }
      )

      expect(options.iconDirs).toEqual(['/repo/app/src/icons', '/shared/icons'])
    })

    test('resolveOptions should keep backwards compatible cwd fallback', () => {
      const options = resolveOptions({
        iconDirs: ['src/icons', '/shared/icons'],
      })

      expect(options.iconDirs[0]).toMatch(/\/src\/icons$/)
      expect(options.iconDirs[1]).toBe('/shared/icons')
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

  describe('option: htmlMode', () => {
    test('htmlMode defaults to inline', () => {
      const options = resolveOptions({
        iconDirs: ['icons'],
      })
      expect(options.htmlMode).toBe('inline')
    })

    test('htmlMode must comply with the allowed values', () => {
      const options = { ...template, htmlMode: 'virtual' } as never

      expect(() => {
        validateOptions(options)
      }).toThrow(ERR_HTML_MODE)
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
