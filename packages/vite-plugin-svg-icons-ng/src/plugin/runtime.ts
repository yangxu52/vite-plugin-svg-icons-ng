import { HMR_EVENT_SVG_ICONS_UPDATE, XMLNS } from '../constants'
import type { CompileResult, ResolvedOptions } from '../types'

type RenderMountCodeOptions = {
  withHmr: boolean
  exportDefault: boolean
  stringContext: 'html' | 'module'
}

export function renderRegisterModule(result: CompileResult, options: ResolvedOptions): string {
  return renderSpriteMountCode(result.sprite, options, {
    withHmr: true,
    exportDefault: true,
    stringContext: 'module',
  })
}

export function renderInlineMountScript(result: CompileResult, options: ResolvedOptions): string {
  return renderSpriteMountCode(result.sprite, options, {
    withHmr: true,
    exportDefault: false,
    stringContext: 'html',
  })
}

function renderSpriteMountCode(sprite: string, options: ResolvedOptions, renderOptions: RenderMountCodeOptions): string {
  const spriteLiteral = toRuntimeStringLiteral(sprite, renderOptions.stringContext)
  const svgNsLiteral = JSON.stringify(XMLNS)
  const domIdLiteral = JSON.stringify(options.customDomId)
  const runtimeKeyLiteral = JSON.stringify('__SVG_ICONS_RUNTIME_STORE__')
  const insertBeforeExpr = options.inject === 'body-first' ? 'body.firstChild' : 'null'
  const hmrCode = renderOptions.withHmr
    ? `
    if (import.meta.hot && !state.hmrBound) {
      import.meta.hot.on(${JSON.stringify(HMR_EVENT_SVG_ICONS_UPDATE)}, function(data) {
        if (data && typeof data.sprite === 'string' && typeof state.mountSvgSprite === 'function') {
          state.mountSvgSprite(data.sprite);
        }
      });
      state.hmrBound = true;
    }`
    : ''

  return `if (typeof window !== 'undefined') {
  (function() {
    const SVG_NS = ${svgNsLiteral};
    const DOM_ID = ${domIdLiteral};
    const RUNTIME_KEY = ${runtimeKeyLiteral};
    const parser = new DOMParser();
    const runtimeStore = window[RUNTIME_KEY] || (window[RUNTIME_KEY] = {});
    const state = runtimeStore[DOM_ID] || (runtimeStore[DOM_ID] = {});
    const getAttributeNames = function(node) {
      if (typeof node.getAttributeNames === 'function') {
        return node.getAttributeNames();
      }
      return [];
    };
    const parseSpriteRoot = function(html) {
      const doc = parser.parseFromString(html, 'image/svg+xml');
      const root = doc && doc.documentElement;
      if (!root || root.nodeName.toLowerCase() !== 'svg') {
        return null;
      }
      if (typeof root.querySelector === 'function' && root.querySelector('parsererror')) {
        return null;
      }
      return root;
    };
    const isSvgRoot = function(node) {
      return !!node && typeof node.nodeName === 'string' && node.nodeName.toLowerCase() === 'svg';
    };
    const createSpriteRoot = function() {
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('id', DOM_ID);
      svg.setAttribute('xmlns', SVG_NS);
      return svg;
    };
    const resolveMountTarget = function() {
      const current = document.getElementById(DOM_ID);
      if (isSvgRoot(current)) {
        return current;
      }
      const replacement = createSpriteRoot();
      const parent = current && current.parentNode;
      if (current && parent && typeof parent.replaceChild === 'function') {
        parent.replaceChild(replacement, current);
        return replacement;
      }
      const body = document.body;
      if (!body) {
        return null;
      }
      body.insertBefore(replacement, ${insertBeforeExpr});
      return replacement;
    };
    const syncAttributes = function(target, source) {
      const sourceAttrNames = getAttributeNames(source);
      for (const name of getAttributeNames(target)) {
        if (!sourceAttrNames.includes(name)) {
          target.removeAttribute(name);
        }
      }
      for (const name of sourceAttrNames) {
        const value = source.getAttribute(name);
        if (value !== null) {
          target.setAttribute(name, value);
        }
      }
    };
    const syncChildren = function(target, source) {
      while (target.firstChild) {
        target.removeChild(target.firstChild);
      }
      for (const child of Array.from(source.childNodes)) {
        const nextChild = document.importNode ? document.importNode(child, true) : child.cloneNode(true);
        target.appendChild(nextChild);
      }
    };
    const mountSvgSprite = function(html) {
      const source = parseSpriteRoot(html);
      if (!source) {
        return;
      }
      const target = resolveMountTarget();
      if (!target) {
        return;
      }
      syncAttributes(target, source);
      syncChildren(target, source);
    };
    state.mountSvgSprite = mountSvgSprite;
    const loadSvgSprite = function() {
      mountSvgSprite(${spriteLiteral});
    };${hmrCode}
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadSvgSprite);
    } else {
      loadSvgSprite();
    }
  })();
}
${renderOptions.exportDefault ? 'export default {}' : ''}`
}

function toRuntimeStringLiteral(value: string, context: 'html' | 'module'): string {
  let literal = JSON.stringify(value)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
  if (context === 'html') {
    literal = literal.replace(/</g, '\\u003C')
  }
  return literal
}
