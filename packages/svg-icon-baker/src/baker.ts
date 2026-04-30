import { optimize } from 'svgo'
import type { Config } from 'svgo'
import { bakeSymbol } from './oven/bake.ts'
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
      return convertSource(source, resolvedOptions, svgoConfig)
    },
    bakeIcons(sources) {
      return sources.map((source) => {
        return convertSource(source, resolvedOptions, svgoConfig)
      })
    },
  }
}

function convertSource(source: BakeSource, options: ResolvedOptions, svgoConfig: Config): BakeResult {
  if (!source || !source.name || !source.content) {
    throw new BakeError('ValidateSourceInvalid', 'Property name and content are required.')
  }
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(source.name)) {
    throw new BakeError('ValidateNameInvalid', 'Invalid name. Use letters, numbers, dash, or underscore, starting with a letter.')
  }
  const normalizedSource = trimSvgPreamble(source.content)
  if (!/^\s*<svg\b/i.test(normalizedSource)) {
    throw new BakeError('ValidateSvgRootInvalid', 'Input must start with an <svg> root element.')
  }
  const optimized = optimizeSvg(normalizedSource, svgoConfig)
  try {
    return bakeSymbol(optimized, source.name, options.idPolicy)
  } catch (cause) {
    if (cause instanceof BakeError) {
      throw cause
    }
    if (cause instanceof Error && cause.message === 'Cannot determine viewBox. Provide an SVG with viewBox or width/height attributes.') {
      throw new BakeError('ResolveViewBoxFailed', cause.message)
    }
    if (cause instanceof Error && cause.message === 'Input must start with an <svg> root element.') {
      throw new BakeError('ValidateSvgRootInvalid', cause.message)
    }
    throw new BakeError('ParseSvgFailed', 'SVG parsing failed during id rewrite.', { cause })
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

function trimSvgPreamble(content: string): string {
  return content.replace(/^(?:\uFEFF|\s|<\?xml[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[\s\S]*?>)+/i, '')
}
