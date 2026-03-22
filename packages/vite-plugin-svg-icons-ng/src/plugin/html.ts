import type { PluginContext, ResolvedOptions } from '../types'
import { renderSpriteElement } from './virtual'

export async function transformPluginIndexHtml(ctx: PluginContext, html: string): Promise<string> {
  if (hasSpriteDom(html, ctx.options.customDomId)) {
    return html
  }
  if (!canInjectIntoHtml(html, ctx.options.inject)) {
    return html
  }
  const result = await ctx.compiler.getResult()
  const spriteHtml = renderSpriteElement(result, ctx.options)
  return injectSpriteIntoHtml(html, spriteHtml, ctx.options.inject)
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

function injectSpriteIntoHtml(html: string, spriteHtml: string, inject: ResolvedOptions['inject']): string {
  if (inject === 'body-first') {
    return html.replace(/<body[^>]*>/i, (tag) => `${tag}${spriteHtml}`)
  }
  return html.replace(/<\/body>/i, `${spriteHtml}</body>`)
}
