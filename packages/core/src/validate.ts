import {
  ERR_CUSTOM_DOM_ID_SYNTAX,
  ERR_ICON_DIRS_REQUIRED,
  ERR_INJECT_MODE,
  ERR_SYMBOL_ID_NO_NAME,
  ERR_SYMBOL_ID_SYNTAX,
  REGEXP_DOM_ID,
  REGEXP_SYMBOL_ID,
} from './constants'
import type { Options } from './typing'

export function validate(opt: Options) {
  // iconDirs is required
  if (!opt.iconDirs || opt.iconDirs.length === 0) {
    throw new Error(ERR_ICON_DIRS_REQUIRED)
  }
  if (opt.symbolId) {
    // symbolId must contain [name]
    if (!opt.symbolId.includes('[name]')) {
      throw new Error(ERR_SYMBOL_ID_NO_NAME)
    } else {
      // symbolId must be a valid ASCII letter, number, underline, hyphen, and starting with a letter, then cannot contain consecutive hyphens
      const clearSymbolId = opt.symbolId.replaceAll(/\[name]/g, '').replaceAll(/\[dir]/g, '')
      if (!REGEXP_SYMBOL_ID.test(clearSymbolId)) {
        throw new Error(ERR_SYMBOL_ID_SYNTAX)
      }
    }
  }
  if (opt.inject && !['body-first', 'body-last'].includes(opt.inject)) {
    throw new Error(ERR_INJECT_MODE)
  }
  // customDomId must be a valid ASCII letter, number, underline, hyphen, and starting with a letter or underline
  if (opt.customDomId && !REGEXP_DOM_ID.test(opt.customDomId)) {
    throw new Error(ERR_CUSTOM_DOM_ID_SYNTAX)
  }
}
