/**
 * @deprecated
 */
export const VIRTUAL_REGISTER_DEPRECATED = 'virtual:svg-icons-register'
export const VIRTUAL_REGISTER = 'virtual:svg-icons/register'
/**
 * @deprecated
 */
export const VIRTUAL_NAMES_DEPRECATED = 'virtual:svg-icons-names'
export const VIRTUAL_IDS = 'virtual:svg-icons/ids'
/**
 * @deprecated
 */
export const VIRTUAL_REGISTER_URL_DEPRECATED = `/@id/__x00__${VIRTUAL_REGISTER_DEPRECATED}`
export const VIRTUAL_REGISTER_URL = `/@id/__x00__${VIRTUAL_REGISTER}`
/**
 * @deprecated
 */
export const VIRTUAL_NAMES_URL_DEPRECATED = `/@id/__x00__${VIRTUAL_NAMES_DEPRECATED}`
export const VIRTUAL_IDS_URL = `/@id/__x00__${VIRTUAL_IDS}`
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
  (function() {
    const loadSvgSprite = function() {
      const body = document.body;
      const el = document.getElementById('${customDomId}');
      if (!el) {
        const svg = document.createElementNS('${XMLNS}', 'svg');
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        svg.id = '${customDomId}';
        svg.setAttribute('xmlns', '${XMLNS}');
        svg.setAttribute('xmlns:link', '${XMLNS_LINK}');
        svg.setAttribute('aria-hidden', true);
        svg.innerHTML = ${JSON.stringify(symbols)};
        body.insertBefore(svg, ${inject === 'body-first' ? 'body.firstChild' : null});
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadSvgSprite);
    } else {
      loadSvgSprite();
    }
  })();
}
export default {}`
