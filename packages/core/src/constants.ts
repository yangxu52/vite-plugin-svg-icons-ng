export const VIRTUAL_REGISTER = 'virtual:svg-icons-register'
export const VIRTUAL_NAMES = 'virtual:svg-icons-names'
export const VIRTUAL_REGISTER_URL = `/@id/__x00__${VIRTUAL_REGISTER}`
export const VIRTUAL_NAMES_URL = `/@id/__x00__${VIRTUAL_NAMES}`
export const SVG_DOM_ID = '__svg__icons__dom__'
export const XMLNS = 'http://www.w3.org/2000/svg'
export const XMLNS_LINK = 'http://www.w3.org/1999/xlink'

export const REGEXP_SYMBOL_ID = /^[A-Za-z][A-Za-z0-9_-]*$/
export const REGEXP_DOM_ID = /^[a-zA-Z_][a-zA-Z0-9_-]*$/

export const PLUGIN_NAME = 'vite-plugin-svg-icons-ng'
export const ERR_ICON_DIRS_REQUIRED = `[${PLUGIN_NAME}]: 'iconDirs' is required!`
export const ERR_SYMBOL_ID_NO_NAME = `[${PLUGIN_NAME}]: 'symbolId' must contain [name] string!`
export const ERR_SYMBOL_ID_SYNTAX = `[${PLUGIN_NAME}]: 'symbolId' must be a valid ASCII letter, number, underline, hyphen, and starting with a letter! (Except for placeholder symbols)`
export const ERR_INJECT_MODE = `[${PLUGIN_NAME}]: 'inject' must be 'body-first' or 'body-last'!`
export const ERR_CUSTOM_DOM_ID_SYNTAX = `[${PLUGIN_NAME}]: 'customDomId' must be a valid ASCII letter, number, underline, hyphen, and starting with a letter or underline!`
export const ERR_SVGO_EXCEPTION = (file: string, error: unknown) => `[${PLUGIN_NAME}]: SVGO optimize failure, skip this file (${file}), caused by:\n${error}`

export const SPRITE_TEMPLATE = (symbols: string, customDomId: string, inject: 'body-first' | 'body-last') => `if (typeof window !== 'undefined') {
  function load() {
    var body = document.body;
    var el = document.getElementById('${customDomId}');
    if (!el) {
      el = document.createElementNS('${XMLNS}', 'svg');
      el.style.position = 'absolute';
      el.style.width = '0';
      el.style.height = '0';
      el.id = '${customDomId}';
      el.setAttribute('xmlns', '${XMLNS}');
      el.setAttribute('xmlns:link', '${XMLNS_LINK}');
      el.setAttribute('aria-hidden', true);
    }
    el.innerHTML = ${JSON.stringify(symbols)};
    ${inject === 'body-last' ? 'body.insertBefore(el, body.firstChild);' : 'body.insertBefore(el, body.lastChild);'}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
}
export default {}`
