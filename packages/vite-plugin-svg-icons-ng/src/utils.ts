import { createHash } from 'node:crypto'
import type { Options } from './types'
import {
  ERR_CUSTOM_DOM_ID_SYNTAX,
  ERR_ICON_DIRS_REQUIRED,
  ERR_INJECT_MODE,
  ERR_SYMBOL_ID_NO_NAME,
  ERR_SYMBOL_ID_SYNTAX,
  REGEXP_DOM_ID,
  REGEXP_SYMBOL_ID,
  SVG_DOM_ID,
} from './constants'

export function getWeakETag(str: string) {
  return str.length === 0 ? 'W/"2jmj7l5rSw0yVb/vlWAYkK/YBwk="' : `W/"${createHash('sha1').update(str, 'utf8').digest('base64')}"`
}

export function generateSymbolId(filePath: string, options: Required<Options>) {
  const { symbolId } = options
  const { dir, name } = splitPath(filePath)
  return symbolId
    .replace(/\[dir]/g, dir)
    .replace(/\[name]/g, name)
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * split path to `dir` and `name`
 */
export function splitPath(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/')
  const lastSlash = normalized.lastIndexOf('/')
  const dirPart = lastSlash > 0 ? normalized.slice(0, lastSlash) : ''
  const filePart = lastSlash >= 0 ? normalized.slice(lastSlash + 1) : normalized

  const dir = dirPart ? dirPart.split('/').filter(Boolean).join('-') : ''
  const dotIndex = filePart.lastIndexOf('.')
  const name = dotIndex > 0 ? filePart.slice(0, dotIndex) : filePart.startsWith('.') ? filePart : filePart

  return { dir, name }
}

export function mergeOptions(userOptions: Options): Required<Options> {
  return {
    symbolId: 'icon-[dir]-[name]',
    svgoOptions: {},
    inject: 'body-last',
    customDomId: SVG_DOM_ID,
    strokeOverride: false,
    ...userOptions,
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
