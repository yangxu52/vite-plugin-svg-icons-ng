import * as csstree from 'css-tree'
import type { BakeIssue } from '../types.ts'
import type { IdCollection, RewriteOptions, XmlTextNode } from './types.ts'
import { collectIds } from './collect.ts'

const URL_REFERENCE_RE = /\burl\((["'])?#(.+?)\1\)/gi
const HREF_REFERENCE_RE = /^#(.+)$/
const SMIL_REFERENCE_RE = /^([A-Za-z0-9_-]+)\.(begin|end)([+-].+)?$/

export function rewriteIds(document: IdCollection['document'], prefix: string, options: RewriteOptions, issues: BakeIssue[]): Map<string, string> {
  const state = collectIds(document)
  collectIssues(state, issues)
  const idMap = createIdMap(state, prefix, options)
  const unresolvedIdMap = new Map<string, string>()
  let nextGeneratedIndex = idMap.size

  rewriteElementIds(state, idMap)
  rewriteReferences(state, idMap, prefix, unresolvedIdMap, () => nextGeneratedIndex++, options, issues)

  return idMap
}

function createIdMap(state: IdCollection, prefix: string, options: RewriteOptions): Map<string, string> {
  const idMap = new Map<string, string>()
  const records = [...state.definedIds.entries()]
    .map(([id, definitions]) => ({
      id,
      order: Math.min(...definitions.map((definition) => definition.order)),
    }))
    .sort((a, b) => a.order - b.order)

  for (let counter = 0; counter < records.length; counter += 1) {
    const { id } = records[counter]
    idMap.set(id, createMappedId(id, prefix, counter, options))
  }
  return idMap
}

function rewriteElementIds(state: IdCollection, idMap: Map<string, string>): void {
  for (const [id, definitions] of state.definedIds) {
    const canonical = definitions[0]
    canonical.element.attrs[canonical.attrName] = idMap.get(id)!

    for (const duplicate of definitions.slice(1)) {
      delete duplicate.element.attrs[duplicate.attrName]
    }
  }
}

function rewriteReferences(
  state: IdCollection,
  idMap: Map<string, string>,
  prefix: string,
  unresolvedIdMap: Map<string, string>,
  nextIndex: () => number,
  options: RewriteOptions,
  issues: BakeIssue[]
): void {
  for (const reference of state.referenceIds) {
    for (const attrRef of reference.attributeRefs) {
      const value = reference.element.attrs[attrRef.attrName]
      if (!value) {
        continue
      }
      if (attrRef.kind === 'href') {
        reference.element.attrs[attrRef.attrName] = rewriteHrefValue(value, idMap, prefix, unresolvedIdMap, nextIndex, options, issues)
        continue
      }
      if (attrRef.kind === 'url' || (attrRef.kind === 'style-attr' && attrRef.attrName === 'style')) {
        reference.element.attrs[attrRef.attrName] = rewriteUrlValue(value, idMap, prefix, unresolvedIdMap, nextIndex, options, issues)
        continue
      }
      if (attrRef.kind === 'begin' || attrRef.kind === 'end') {
        reference.element.attrs[attrRef.attrName] = rewriteSmilValue(value, idMap, prefix, unresolvedIdMap, nextIndex, options, issues)
        continue
      }
      if (attrRef.kind === 'aria-labelledby' || attrRef.kind === 'aria-describedby') {
        reference.element.attrs[attrRef.attrName] = rewriteTokenList(value, idMap, prefix, unresolvedIdMap, nextIndex, options, issues)
      }
    }

    for (const styleRef of reference.styleRefs) {
      styleRef.textNode['#text'] = rewriteStyleText(styleRef.textNode, idMap, prefix, unresolvedIdMap, nextIndex, options, issues)
    }
  }
}

function rewriteHrefValue(
  value: string,
  idMap: Map<string, string>,
  prefix: string,
  unresolvedIdMap: Map<string, string>,
  nextIndex: () => number,
  options: RewriteOptions,
  issues: BakeIssue[]
): string {
  const match = HREF_REFERENCE_RE.exec(value)
  if (!match) {
    return value
  }
  const source = decodeURI(match[1])
  const next = idMap.get(source)
  if (next) {
    return `#${next}`
  }
  return rewriteUnresolvedReference(source, value, prefix, unresolvedIdMap, nextIndex, options, issues, (resolved) => `#${resolved}`)
}

function rewriteUrlValue(
  value: string,
  idMap: Map<string, string>,
  prefix: string,
  unresolvedIdMap: Map<string, string>,
  nextIndex: () => number,
  options: RewriteOptions,
  issues: BakeIssue[]
): string {
  return value.replace(URL_REFERENCE_RE, (match, quote, body) => {
    const source = decodeURI(body)
    const next = idMap.get(source)
    if (!next) {
      return rewriteUnresolvedReference(source, match, prefix, unresolvedIdMap, nextIndex, options, issues, (resolved) => {
        const wrappedQuote = quote ?? ''
        return `url(${wrappedQuote}#${resolved}${wrappedQuote})`
      })
    }
    const wrappedQuote = quote ?? ''
    return `url(${wrappedQuote}#${next}${wrappedQuote})`
  })
}

function rewriteSmilValue(
  value: string,
  idMap: Map<string, string>,
  prefix: string,
  unresolvedIdMap: Map<string, string>,
  nextIndex: () => number,
  options: RewriteOptions,
  issues: BakeIssue[]
): string {
  const parts = value.split(/\s*;\s*/)
  return parts
    .map((part) => {
      const match = SMIL_REFERENCE_RE.exec(part)
      if (!match) {
        return part
      }
      const next = idMap.get(match[1])
      if (!next) {
        return rewriteUnresolvedReference(match[1], part, prefix, unresolvedIdMap, nextIndex, options, issues, (resolved) => {
          const offset = match[3] ?? ''
          return `${resolved}.${match[2]}${offset}`
        })
      }
      const offset = match[3] ?? ''
      return `${next}.${match[2]}${offset}`
    })
    .join('; ')
}

function rewriteTokenList(
  value: string,
  idMap: Map<string, string>,
  prefix: string,
  unresolvedIdMap: Map<string, string>,
  nextIndex: () => number,
  options: RewriteOptions,
  issues: BakeIssue[]
): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const next = idMap.get(token)
      if (next) {
        return next
      }
      return rewriteUnresolvedReference(token, token, prefix, unresolvedIdMap, nextIndex, options, issues, (resolved) => resolved)
    })
    .join(' ')
}

function rewriteStyleText(
  textNode: XmlTextNode,
  idMap: Map<string, string>,
  prefix: string,
  unresolvedIdMap: Map<string, string>,
  nextIndex: () => number,
  options: RewriteOptions,
  issues: BakeIssue[]
): string {
  let cssAst: csstree.CssNode
  try {
    cssAst = csstree.parse(textNode['#text'], {
      parseValue: true,
      parseCustomProperty: false,
    })
  } catch {
    return textNode['#text']
  }

  csstree.walk(cssAst, (node: csstree.CssNode) => {
    if (node.type === 'IdSelector' && typeof node.name === 'string') {
      const next = idMap.get(node.name)
      if (next) {
        node.name = next
        return
      }
      const rewritten = rewriteUnresolvedReference(node.name, node.name, prefix, unresolvedIdMap, nextIndex, options, issues, (resolved) => resolved)
      if (rewritten !== node.name) {
        node.name = rewritten
      }
      return
    }
    if (node.type === 'Url' && typeof node.value === 'string' && node.value.length > 0) {
      const raw = unquote(node.value)
      if (!raw.startsWith('#')) {
        return
      }
      const source = decodeURI(raw.slice(1))
      const next = idMap.get(source)
      if (!next) {
        const rewritten = rewriteUnresolvedReference(source, `#${source}`, prefix, unresolvedIdMap, nextIndex, options, issues, (resolved) => `#${resolved}`)
        if (rewritten !== `#${source}`) {
          node.value = rewritten
        }
        return
      }
      node.value = `#${next}`
    }
  })

  return csstree.generate(cssAst)
}
const BASE52_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
function encodeIndex(index: number): string {
  let current = index
  let result = ''
  do {
    result = BASE52_ALPHABET[current % 52] + result
    current = Math.floor(current / 52) - 1
  } while (current >= 0)

  return result
}

function createMappedId(sourceId: string, prefix: string, index: number, options: RewriteOptions): string {
  const delim = resolveDelim(options)
  const style = options.idStyle
  if (style === 'named') {
    return `${prefix}${delim}${sourceId}`
  }
  if (style === 'hashed') {
    return `${prefix}${delim}${hashId(sourceId)}`
  }
  return `${prefix}${delim}${encodeIndex(index)}`
}

function hashId(value: string): string {
  return toBase62(digest_djb2(value))
}
function digest_djb2(str: string): number {
  let hash = 0x1505
  for (const char of str) {
    hash = ((hash << 5) + hash) ^ char.charCodeAt(0)
  }
  return hash >>> 0
}
const BASE62_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
function toBase62(value: number): string {
  let current = value
  let result = ''
  do {
    result = BASE62_ALPHABET[current % 62] + result
    current = Math.floor(current / 62)
  } while (current > 0)
  return result
}
function createUnresolvedMappedId(
  sourceId: string,
  prefix: string,
  unresolvedIdMap: Map<string, string>,
  nextIndex: () => number,
  options: RewriteOptions
): string {
  const existing = unresolvedIdMap.get(sourceId)
  if (existing) {
    return existing
  }

  const generated = createMappedId(sourceId, prefix, nextIndex(), options)
  unresolvedIdMap.set(sourceId, generated)
  return generated
}

function rewriteUnresolvedReference(
  targetId: string,
  originalValue: string,
  prefix: string,
  unresolvedIdMap: Map<string, string>,
  nextIndex: () => number,
  options: RewriteOptions,
  issues: BakeIssue[],
  format: (resolved: string) => string
): string {
  pushIssue(issues, {
    code: 'ResolveReferenceFailed',
    message: `Resolve reference failed for local target "${targetId}"; reference was ${options.unresolved === 'prefix' ? 'prefixed' : 'preserved'}.`,
    targetId,
  })

  if (options.unresolved === 'preserve') {
    return originalValue
  }

  return format(createUnresolvedMappedId(targetId, prefix, unresolvedIdMap, nextIndex, options))
}

function resolveDelim(options: RewriteOptions): '-' | '_' {
  if (options.delim != null) {
    return options.delim
  }
  return '_'
}

function collectIssues(state: IdCollection, issues: BakeIssue[]): void {
  for (const [id, definitions] of state.definedIds) {
    if (definitions.length > 1) {
      pushIssue(issues, {
        code: 'DetectDefinitionDuplicate',
        message: `Detect definition duplicate for local target "${id}"; first occurrence was kept.`,
        targetId: id,
      })
    }
  }

  if (state.styleParseFailureCount > 0) {
    pushIssue(issues, {
      code: 'ParseStyleFailed',
      message: 'Parse style failed for one or more <style> blocks; original content was preserved.',
    })
  }
}

function pushIssue(issues: BakeIssue[], issue: BakeIssue): void {
  const exists = issues.some((current) => current.code === issue.code && current.targetId === issue.targetId && current.message === issue.message)
  if (!exists) {
    issues.push(issue)
  }
}

function unquote(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}
