import { rewriteRoot } from './root.ts'
import { buildSvg, parseSvg } from './xml.ts'
import { rewriteIds } from './rewrite.ts'
import type { RewriteOptions } from './types.ts'
import type { BakeIssue, BakeResult } from '../types.ts'

export function bakeSymbol(content: string, name: string, options: RewriteOptions & { rewrite: boolean }): BakeResult {
  const document = parseSvg(content)
  const issues: BakeIssue[] = []
  if (options.rewrite) {
    rewriteIds(document, name, options, issues)
  }
  rewriteRoot(document, name)
  return {
    name,
    content: buildSvg(document).trim(),
    issues,
  }
}
