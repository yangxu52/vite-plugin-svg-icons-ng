import { optimize } from 'svgo'
import { createSvgoConfig, resolveOptions } from './options.ts'
import type { BakeResult, BakeSource, Options, ResolvedOptions, SvgoOutput } from './types.ts'

export function bakeIcon(source: BakeSource, options?: Options): BakeResult {
  const resolvedOptions = resolveOptions(options)
  return {
    name: source.name,
    content: convertToSymbol(source, resolvedOptions),
  }
}

export function bakeIcons(sources: BakeSource[], options?: Options): BakeResult[] {
  const resolvedOptions = resolveOptions(options)
  return sources.map((source) => ({
    name: source.name,
    content: convertToSymbol(source, resolvedOptions),
  }))
}

function convertToSymbol(source: BakeSource, options: ResolvedOptions): string {
  if (!source || !source.name || !source.content) {
    throw new TypeError('Property name and content are required.')
  }
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(source.name)) {
    throw new TypeError('Invalid name. Use letters, numbers, dash, or underscore, starting with a letter.')
  }
  const normalizedSource = stripLeadingSvgPreamble(source.content)
  if (!/^\s*<svg\b/i.test(normalizedSource)) {
    throw new Error('Parsing failed. Input must start with an <svg> root element.')
  }
  let result: SvgoOutput
  try {
    result = optimize(normalizedSource, createSvgoConfig(source.name, options))
  } catch (err) {
    throw new Error(`Parsing failed. ${String(err)}`)
  }
  const viewBox = result.data.match(/viewBox="([^"]+)"/)?.[1]
  if (!viewBox) {
    throw new Error('Cannot determine viewBox. Provide an SVG with viewBox or width/height attributes.')
  }
  const cleanedSvg = stripLeadingSvgPreamble(result.data)
  return toSymbolRootTag(cleanedSvg, source.name, viewBox)
}

function stripLeadingSvgPreamble(content: string): string {
  return content.replace(/^(?:\uFEFF|\s|<\?xml[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[\s\S]*?>)+/i, '')
}

function toSymbolRootTag(svg: string, symbolId: string, viewBox: string): string {
  const rootOpenTag = svg.match(/^\s*<svg\b[^>]*>/i)![0]
  const preservedAttrs = rootOpenTag
    .replace(/^\s*<svg\b/i, '')
    .replace(/>\s*$/i, '')
    .replace(/\s+id=(['"])[^'"]*\1/gi, '')
    .replace(/\s+viewBox=(['"])[^'"]*\1/gi, '')
    .replace(/\s+width=(['"])[^'"]*\1/gi, '')
    .replace(/\s+height=(['"])[^'"]*\1/gi, '')
    .trim()
  const attrs = preservedAttrs ? ` ${preservedAttrs}` : ''
  const symbolOpenTag = `<symbol id="${symbolId}" viewBox="${viewBox}"${attrs}>`
  return svg
    .replace(/^\s*<svg\b[^>]*>/i, symbolOpenTag)
    .replace(/<\/svg>\s*$/i, '</symbol>')
    .trim()
}
