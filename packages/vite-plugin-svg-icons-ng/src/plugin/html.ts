import type { PluginContext, ResolvedOptions } from '../types'
import { renderInlineMountScript } from './runtime'
import { renderSpriteElement } from './virtual'

export async function pluginTransformIndexHtml(ctx: PluginContext, html: string): Promise<string> {
  if (ctx.options.htmlMode === 'none') {
    return html
  }
  if (!canInjectIntoHtml(html, ctx.options.inject)) {
    return html
  }
  if (ctx.options.htmlMode === 'inline' && hasSpriteDom(html, ctx.options.customDomId)) {
    return html
  }
  const result = await ctx.compiler.getResult()
  if (ctx.options.htmlMode === 'inline') {
    return injectSpriteIntoHtml(html, renderSpriteElement(result), ctx.options.inject)
  }
  return injectMountScriptIntoHtml(html, renderInlineMountScript(result, ctx.options), ctx.options.inject)
}

function hasSpriteDom(html: string, domId: string): boolean {
  return html.includes(`id="${domId}"`) || html.includes(`id='${domId}'`)
}

function canInjectIntoHtml(html: string, inject: ResolvedOptions['inject']): boolean {
  if (inject === 'body-first') {
    return /<body[^>]*>/i.test(html)
  }
  return /<\/body>/i.test(html)
}

function injectMountScriptIntoHtml(html: string, script: string, inject: ResolvedOptions['inject']): string {
  const scriptHtml = `<script type="module">${escapeInlineScript(script)}</script>`
  if (inject === 'body-first') {
    return html.replace(/<body[^>]*>/i, (tag) => `${tag}${scriptHtml}`)
  }
  return html.replace(/<\/body>/i, `${scriptHtml}</body>`)
}

function injectSpriteIntoHtml(html: string, spriteHtml: string, inject: ResolvedOptions['inject']): string {
  if (inject === 'body-first') {
    return html.replace(/<body[^>]*>/i, (tag) => `${tag}${spriteHtml}`)
  }
  return html.replace(/<\/body>/i, `${spriteHtml}</body>`)
}

function escapeInlineScript(script: string): string {
  return script.replace(/<\/script/gi, '<\\/script')
}
