import { buildSymbol } from './symbol.ts'
import { parseSvg } from './parse.ts'
import { rewriteIds } from './rewrite.ts'
import type { RewriteInputOptions } from './types.ts'
import type { BakeIssue } from '../types.ts'

export function bakeSymbol(
  code: string,
  symbolId: string,
  options: RewriteInputOptions & { rewrite: boolean }
): { content: string; issues: import('../types.ts').BakeIssue[] } {
  const document = parseSvg(code)
  const issues: BakeIssue[] = []
  if (options.rewrite) {
    rewriteIds(document, symbolId, options, issues)
  }
  return {
    content: buildSymbol(document, symbolId),
    issues,
  }
}
