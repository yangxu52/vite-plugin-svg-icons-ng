import { rewriteRoot } from './root'
import { buildSvg, parseSvg } from './xml'
import { rewriteIds } from './rewrite'
import type { RewriteOptions } from './types'
import type { BakeIssue, BakeResult } from '../types'

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
