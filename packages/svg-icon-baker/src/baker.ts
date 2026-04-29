import { optimize } from 'svgo'
import type { Config } from 'svgo'
import { rewriteSvgIds } from './oven/rewrite.ts'
import { createSvgoConfig, resolveOptions } from './options.ts'
import { BakeError } from './types.ts'
import type { BakeResult, Baker, BakeSource, Options, ResolvedOptions, SvgoOutput } from './types.ts'

export function bakeIcon(source: BakeSource, options?: Options): BakeResult {
  return createBaker(options).bakeIcon(source)
}

export function bakeIcons(sources: BakeSource[], options?: Options): BakeResult[] {
  return createBaker(options).bakeIcons(sources)
}

export function createBaker(options?: Options): Baker {
  const resolvedOptions = resolveOptions(options)
  const svgoConfig = createSvgoConfig(resolvedOptions)
  return {
    bakeIcon(source) {
      return convertToBakeResult(source, resolvedOptions, svgoConfig)
    },
    bakeIcons(sources) {
      return sources.map((source) => convertToBakeResult(source, resolvedOptions, svgoConfig))
    },
  }
}

function convertToBakeResult(source: BakeSource, options: ResolvedOptions, svgoConfig: Config): BakeResult {
  const baked = convertToSymbol(source, options, svgoConfig)
  return {
    name: source.name,
    content: baked.content,
    issues: baked.issues,
  }
}

function convertToSymbol(source: BakeSource, options: ResolvedOptions, svgoConfig: Config): Pick<BakeResult, 'content' | 'issues'> {
  if (!source || !source.name || !source.content) {
    throw new BakeError('ValidateSourceInvalid', 'Property name and content are required.')
  }
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(source.name)) {
    throw new BakeError('ValidateNameInvalid', 'Invalid name. Use letters, numbers, dash, or underscore, starting with a letter.')
  }
  const normalizedSource = stripLeadingSvgPreamble(source.content)
  if (!/^\s*<svg\b/i.test(normalizedSource)) {
    throw new BakeError('ValidateSvgRootInvalid', 'Input must start with an <svg> root element.')
  }
  const optimized = optimizeSvg(normalizedSource, svgoConfig)
  let issues: BakeResult['issues'] = []
  const baked = options.idPolicy.rewrite
    ? safelyRewriteSvgIds(optimized, source.name, options.idPolicy)
    : { code: optimized, idMap: new Map<string, string>(), issues: [] }
  issues = baked.issues
  return {
    content: toSymbol(baked.code, source.name),
    issues,
  }
}

function optimizeSvg(content: string, svgoConfig: Config): string {
  let result: SvgoOutput
  try {
    result = optimize(content, svgoConfig)
  } catch (cause) {
    throw new BakeError('OptimizeSvgFailed', 'SVGO optimization failed.', { cause })
  }
  return result.data
}

function safelyRewriteSvgIds(source: string, symbolId: string, options: ResolvedOptions['idPolicy']) {
  try {
    return rewriteSvgIds(source, symbolId, options)
  } catch (cause) {
    throw new BakeError('ParseSvgFailed', 'SVG parsing failed during id rewrite.', { cause })
  }
}

function stripLeadingSvgPreamble(content: string): string {
  return content.replace(/^(?:\uFEFF|\s|<\?xml[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[\s\S]*?>)+/i, '')
}

function toSymbol(svg: string, symbolId: string): string {
  const viewBox = resolveViewBox(svg)
  if (!viewBox) {
    throw new BakeError('ResolveViewBoxFailed', 'Cannot determine viewBox. Provide an SVG with viewBox or width/height attributes.')
  }
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

function resolveViewBox(svg: string): string | null {
  const rootOpenTag = svg.match(/^\s*<svg\b[^>]*>/i)?.[0]
  if (!rootOpenTag) {
    return null
  }
  const explicitViewBox = rootOpenTag.match(/\sviewBox=(['"])([^'"]*)\1/i)?.[2]
  if (explicitViewBox) {
    return explicitViewBox
  }
  const width = resolveDimension(rootOpenTag, 'width')
  const height = resolveDimension(rootOpenTag, 'height')
  if (width == null || height == null) {
    return null
  }
  return `0 0 ${width} ${height}`
}

function resolveDimension(tag: string, name: 'width' | 'height'): string | null {
  const raw = tag.match(new RegExp(`\\s${name}=(['"])([^'"]*)\\1`, 'i'))?.[2]
  if (!raw) {
    return null
  }
  const normalized = raw.trim()
  if (/^-?\d+(?:\.\d+)?$/.test(normalized)) {
    return String(Number(normalized))
  }
  if (/^-?\d+(?:\.\d+)?px$/i.test(normalized)) {
    return String(Number(normalized.slice(0, -2)))
  }
  return null
}
