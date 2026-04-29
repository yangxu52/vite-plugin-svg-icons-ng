import { rewriteRoot } from './root.ts'
import { buildSvg, parseSvg } from './xml.ts'
import { rewriteIds } from './rewrite.ts'
import type { RewriteOptions } from './types.ts'
import type { BakeIssue } from '../types.ts'

export function bakeSymbol(
  code: string,
  symbolId: string,
  options: RewriteOptions & { rewrite: boolean }
): { content: string; issues: import('../types.ts').BakeIssue[] } {
  const document = parseSvg(code)
  const issues: BakeIssue[] = []
  if (options.rewrite) {
    rewriteIds(document, symbolId, options, issues)
  }
  rewriteRoot(document, symbolId)
  return {
    content: buildSvg(document).trim(),
    issues,
  }
}
