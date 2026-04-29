import * as csstree from 'css-tree'
import type {
  AttributeReference,
  DefinedIdRecord,
  ElementReferences,
  ElementRecord,
  IdCollection,
  StyleReference,
  XmlAttributes,
  XmlDocument,
  XmlTextNode,
} from './types.ts'
import { getElementEntry, visitElements } from './xml.ts'

const URL_REFERENCE_RE = /\burl\((["'])?#(.+?)\1\)/gi
const HREF_REFERENCE_RE = /^#(.+)$/
const SMIL_REFERENCE_RE = /^([A-Za-z0-9_-]+)\.(begin|end)([+-].+)?$/
export function collectIds(document: XmlDocument): IdCollection {
  const elements: ElementRecord[] = []
  const definedIds = new Map<string, DefinedIdRecord[]>()
  const referenceIds: ElementReferences[] = []
  let styleParseFailureCount = 0
  let order = 0

  visitElements(document, (name, node, attrs) => {
    const element: ElementRecord = { name, node, attrs }
    elements.push(element)

    for (const attrName of ['id', 'xml:id'] as const) {
      const id = attrs[attrName]
      if (!id) {
        continue
      }
      const records = definedIds.get(id) ?? []
      records.push({
        id,
        attrName,
        element,
        order,
      })
      definedIds.set(id, records)
      order += 1
    }

    const attributeRefs = collectAttributeReferences(attrs)
    const styleResult = collectStyleReferences(element)
    const styleRefs = styleResult.references
    styleParseFailureCount += styleResult.parseFailureCount
    if (attributeRefs.length === 0 && styleRefs.length === 0) {
      return
    }

    referenceIds.push({ element, attributeRefs, styleRefs })
  })

  return {
    document,
    elements,
    definedIds,
    referenceIds,
    styleParseFailureCount,
  }
}

function collectAttributeReferences(attrs: XmlAttributes): AttributeReference[] {
  const refs: AttributeReference[] = []

  for (const [attrName, value] of Object.entries(attrs)) {
    if (!value) {
      continue
    }

    if (attrName === 'href' || attrName === 'xlink:href') {
      const match = HREF_REFERENCE_RE.exec(value)
      if (match) {
        refs.push({
          kind: 'href',
          attrName,
          targetIds: [decodeURI(match[1])],
        })
      }
      continue
    }

    if (isUrlReferenceAttribute(attrName)) {
      const targetIds = collectUrlReferences(value)
      if (targetIds.length > 0) {
        refs.push({
          kind: attrName === 'style' ? 'style-attr' : 'url',
          attrName,
          targetIds,
        })
      }
      continue
    }

    if (attrName === 'begin' || attrName === 'end') {
      const targetIds = collectSmilReferences(value)
      if (targetIds.length > 0) {
        refs.push({
          kind: attrName,
          attrName,
          targetIds,
        })
      }
      continue
    }

    if (attrName === 'aria-labelledby' || attrName === 'aria-describedby') {
      const targetIds = value.split(/\s+/).filter(Boolean)
      if (targetIds.length > 0) {
        refs.push({
          kind: attrName,
          attrName,
          targetIds,
        })
      }
    }
  }

  return refs
}

function collectStyleReferences(element: ElementRecord): { references: StyleReference[]; parseFailureCount: number } {
  if (element.name !== 'style') {
    return { references: [], parseFailureCount: 0 }
  }
  const entry = getElementEntry(element.node)
  if (!entry) {
    return { references: [], parseFailureCount: 0 }
  }

  const refs: StyleReference[] = []
  let parseFailureCount = 0
  for (const child of entry.children) {
    if (!('#text' in child) || typeof child['#text'] !== 'string') {
      continue
    }
    const result = collectStyleTextReferences(child['#text'])
    parseFailureCount += result.parseFailureCount
    const targetIds = result.targetIds
    if (targetIds.length === 0) {
      continue
    }
    refs.push({
      kind: 'style-selector',
      textNode: child as XmlTextNode,
      targetIds,
    })
  }
  return {
    references: refs,
    parseFailureCount,
  }
}

function collectUrlReferences(value: string): string[] {
  const ids: string[] = []
  for (const match of value.matchAll(URL_REFERENCE_RE)) {
    ids.push(decodeURI(match[2]))
  }
  return ids
}

function collectSmilReferences(value: string): string[] {
  return value
    .split(/\s*;\s*/)
    .map((part) => SMIL_REFERENCE_RE.exec(part)?.[1] ?? null)
    .filter((id): id is string => id != null)
}

function collectStyleTextReferences(value: string): { targetIds: string[]; parseFailureCount: number } {
  const ids = new Set<string>()
  let cssAst: csstree.CssNode
  try {
    cssAst = csstree.parse(value, {
      parseValue: true,
      parseCustomProperty: false,
    })
  } catch {
    return {
      targetIds: [],
      parseFailureCount: 1,
    }
  }

  csstree.walk(cssAst, (node: csstree.CssNode) => {
    if (node.type === 'IdSelector' && typeof node.name === 'string') {
      ids.add(node.name)
      return
    }
    if (node.type === 'Url' && typeof node.value === 'string' && node.value.length > 0) {
      const raw = unquote(node.value)
      if (raw.startsWith('#')) {
        ids.add(decodeURI(raw.slice(1)))
      }
    }
  })

  return {
    targetIds: [...ids],
    parseFailureCount: 0,
  }
}

function isUrlReferenceAttribute(attrName: string): boolean {
  return (
    attrName === 'clip-path' ||
    attrName === 'color-profile' ||
    attrName === 'fill' ||
    attrName === 'filter' ||
    attrName === 'marker-end' ||
    attrName === 'marker-mid' ||
    attrName === 'marker-start' ||
    attrName === 'mask' ||
    attrName === 'stroke' ||
    attrName === 'style'
  )
}

function unquote(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}
