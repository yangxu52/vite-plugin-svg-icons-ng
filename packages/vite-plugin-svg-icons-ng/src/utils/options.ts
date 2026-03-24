import type { Options, ResolvedOptions, ResolvedStrokeOverride } from '../types'
import {
  ERR_CUSTOM_DOM_ID_SYNTAX,
  ERR_ICON_DIRS_REQUIRED,
  ERR_INJECT_MODE,
  ERR_SYMBOL_ID_NO_NAME,
  ERR_SYMBOL_ID_SYNTAX,
  REGEXP_DOM_ID,
  REGEXP_SYMBOL_ID,
  SVG_DOM_ID,
} from '../constants'

const defaultOptions = {
  symbolId: 'icon-[dir]-[name]',
  inject: 'body-last',
  customDomId: SVG_DOM_ID,
  strokeOverride: false,
  bakerOptions: {},
} satisfies Omit<ResolvedOptions, 'iconDirs'>

function normalizeStrokeOverride(value: Options['strokeOverride']): ResolvedStrokeOverride {
  if (value === true) {
    return 'currentColor'
  }
  if (typeof value === 'string') {
    return value
  }
  return false
}

export function resolveOptions(userOptions: Options): ResolvedOptions {
  return {
    iconDirs: userOptions.iconDirs,
    symbolId: userOptions.symbolId ?? defaultOptions.symbolId,
    inject: userOptions.inject ?? defaultOptions.inject,
    customDomId: userOptions.customDomId ?? defaultOptions.customDomId,
    strokeOverride: normalizeStrokeOverride(userOptions.strokeOverride),
    bakerOptions: userOptions.bakerOptions ?? defaultOptions.bakerOptions,
  }
}

export function validateOptions(opt: Options) {
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
