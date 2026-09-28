import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { normalizePath } from 'vite'
import {
  ERR_CUSTOM_DOM_CLASS_SYNTAX,
  ERR_CUSTOM_DOM_ID_SYNTAX,
  ERR_CUSTOM_DOM_STYLE_SYNTAX,
  ERR_HTML_MODE,
  ERR_ICON_DIRS_REQUIRED,
  ERR_SYMBOL_ID_NO_NAME,
  ERR_SYMBOL_ID_SYNTAX,
} from '../../../src/constants'
import { resolveOptions, resolveOptionsWithContext, validateOptions } from '../../../src/utils/options'

describe('Test ValidateOption', () => {
  const viteRoot = normalizePath(resolve('/repo/app'))
  const sharedIconsDir = normalizePath(resolve('/shared/icons'))
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
          iconDirs: ['src/icons', sharedIconsDir],
        },
        { root: viteRoot }
      )

      expect(options.iconDirs).toEqual([`${viteRoot}/src/icons`, sharedIconsDir])
    })

    test('resolveOptions should keep backwards compatible cwd fallback', () => {
      const options = resolveOptions({
        iconDirs: ['src/icons', sharedIconsDir],
      })

      expect(options.iconDirs[0]).toMatch(/\/src\/icons$/)
      expect(options.iconDirs[1]).toBe(sharedIconsDir)
    })
  })
  describe('option: symbolId', () => {
    test('SymbolId must contain [name] string!', () => {
      const options = { ...template, symbolId: 'icon-[dir]' }

      expect(() => {
        validateOptions(options)
      }).toThrow(ERR_SYMBOL_ID_NO_NAME)
    })

    test.each(['[name]', '[dir]-[name]', 'icon-[name]'])('symbolId should allow supported template %s', (symbolId) => {
      const options = { ...template, symbolId }

      expect(() => {
        validateOptions(options)
      }).not.toThrow()
    })

    test('symbolId must comply with the syntax', () => {
      const options = { ...template, symbolId: '0-[name]' }

      expect(() => {
        validateOptions(options)
      }).toThrow(ERR_SYMBOL_ID_SYNTAX)
    })

    test.each(['[name].svg', 'foo [name]'])('symbolId should reject invalid template %s', (symbolId) => {
      const options = { ...template, symbolId }

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

  describe('option: customDomClass', () => {
    test('defaults to the BEM sprite class', () => {
      expect(resolveOptions({ iconDirs: ['icons'] }).customDomClass).toBe('svg-icons__sprite')
    })

    test.each(['custom-sprite', '_sprite2', 'svg-icons__sprite'])('allows a valid single class token: %s', (customDomClass) => {
      expect(() => validateOptions({ ...template, customDomClass })).not.toThrow()
    })

    test('allows false to disable the class attribute', () => {
      expect(() => validateOptions({ ...template, customDomClass: false })).not.toThrow()
      expect(resolveOptions({ iconDirs: ['icons'], customDomClass: false }).customDomClass).toBe(false)
    })

    test.each(['', ' ', 'foo bar', '0sprite', 'foo.bar'])('rejects invalid class token: %j', (customDomClass) => {
      expect(() => validateOptions({ ...template, customDomClass })).toThrow(ERR_CUSTOM_DOM_CLASS_SYNTAX)
    })

    test.each([0, {}, true])('rejects non-string class values: %j', (customDomClass) => {
      expect(() => validateOptions({ ...template, customDomClass } as never)).toThrow(ERR_CUSTOM_DOM_CLASS_SYNTAX)
    })
  })

  describe('option: customDomStyle', () => {
    test('defaults to the hidden sprite style', () => {
      expect(resolveOptions({ iconDirs: ['icons'] }).customDomStyle).toBe('position:absolute;width:0;height:0')
    })

    test('allows a valid non-empty CSS declaration list', () => {
      expect(() => validateOptions({ ...template, customDomStyle: 'position: absolute; overflow: hidden' })).not.toThrow()
    })

    test('allows false to disable the style attribute', () => {
      expect(() => validateOptions({ ...template, customDomStyle: false })).not.toThrow()
      expect(resolveOptions({ iconDirs: ['icons'], customDomStyle: false }).customDomStyle).toBe(false)
    })

    test.each(['', '   ', 'color:"red"', '<style>x</style>', 'color:red`', 'color:{red}', 'color:red&blue', 'color:red\u0000', 'color:red\n'])(
      'rejects invalid CSS declaration list: %j',
      (customDomStyle) => {
        expect(() => validateOptions({ ...template, customDomStyle })).toThrow(ERR_CUSTOM_DOM_STYLE_SYNTAX)
      }
    )

    test.each([0, {}, true])('rejects non-string style values: %j', (customDomStyle) => {
      expect(() => validateOptions({ ...template, customDomStyle } as never)).toThrow(ERR_CUSTOM_DOM_STYLE_SYNTAX)
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
