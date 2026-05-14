export const VIRTUAL_ID_PREFIX = 'virtual:svg-icons'
/**
 * @deprecated Will be removed in v2.0.0. Use `VIRTUAL_REGISTER`.
 */
export const VIRTUAL_REGISTER_DEPRECATED = `${VIRTUAL_ID_PREFIX}-register`
export const VIRTUAL_REGISTER = `${VIRTUAL_ID_PREFIX}/register`
/**
 * @deprecated Will be removed in v2.0.0. Use `VIRTUAL_IDS`.
 */
export const VIRTUAL_NAMES_DEPRECATED = `${VIRTUAL_ID_PREFIX}-names`
export const VIRTUAL_IDS = `${VIRTUAL_ID_PREFIX}/ids`
export const VIRTUAL_SPRITE = `${VIRTUAL_ID_PREFIX}/sprite`
/**
 * @deprecated Will be removed in v2.0.0. Use `VIRTUAL_REGISTER_URL`.
 */
export const VIRTUAL_REGISTER_URL_DEPRECATED = `/@id/__x00__${VIRTUAL_REGISTER_DEPRECATED}`
export const VIRTUAL_REGISTER_URL = `/@id/__x00__${VIRTUAL_REGISTER}`
/**
 * @deprecated Will be removed in v2.0.0. Use `VIRTUAL_IDS_URL`.
 */
export const VIRTUAL_NAMES_URL_DEPRECATED = `/@id/__x00__${VIRTUAL_NAMES_DEPRECATED}`
export const VIRTUAL_IDS_URL = `/@id/__x00__${VIRTUAL_IDS}`
export const VIRTUAL_SPRITE_URL = `/@id/__x00__${VIRTUAL_SPRITE}`
export const HMR_EVENT_SVG_ICONS_UPDATE = 'svg-icons:update'
export const SVG_DOM_ID = '__svg__icons__dom__'
export const XMLNS = 'http://www.w3.org/2000/svg'

export const REGEXP_SYMBOL_ID = /^[A-Za-z][A-Za-z0-9_-]*$/
export const REGEXP_DOM_ID = /^[a-zA-Z_][a-zA-Z0-9_-]*$/

export const PLUGIN_NAME = 'vite-plugin-svg-icons-ng'
export const ERR_ICON_DIRS_REQUIRED = `[${PLUGIN_NAME}]: 'iconDirs' is required!`
export const ERR_SYMBOL_ID_NO_NAME = `[${PLUGIN_NAME}]: 'symbolId' must contain [name] string!`
export const ERR_SYMBOL_ID_SYNTAX = `[${PLUGIN_NAME}]: 'symbolId' must produce a valid ASCII letter, number, underline, hyphen id, starting with a letter! (Supported placeholders: [name], [dir])`
export const ERR_INJECT_MODE = `[${PLUGIN_NAME}]: 'inject' must be 'body-first' or 'body-last'!`
export const ERR_HTML_MODE = `[${PLUGIN_NAME}]: 'htmlMode' must be 'script', 'inline', or 'none'!`
export const ERR_CUSTOM_DOM_ID_SYNTAX = `[${PLUGIN_NAME}]: 'customDomId' must be a valid ASCII letter, number, underline, hyphen, and starting with a letter or underline!`
