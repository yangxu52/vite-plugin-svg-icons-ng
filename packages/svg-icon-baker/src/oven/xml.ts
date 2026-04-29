import XMLBuilder from 'fast-xml-builder'
import { XMLParser } from 'fast-xml-parser'
import type { ElementEntry, XmlAttributes, XmlDocument, XmlElementNode, XmlNode } from './types.ts'

const parser = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: '',
  trimValues: false,
  parseTagValue: false,
  parseAttributeValue: false,
  commentPropName: '#comment',
  cdataPropName: '#cdata',
})

const builder = new XMLBuilder({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: '',
  suppressEmptyNode: true,
  commentPropName: '#comment',
  cdataPropName: '#cdata',
})

export function parseSvg(code: string): XmlDocument {
  return parser.parse(code) as XmlDocument
}

export function buildSvg(document: XmlDocument): string {
  return builder.build(document)
}

export function visitElements(document: XmlDocument, visit: (name: string, node: XmlElementNode, attrs: XmlAttributes) => void): void {
  for (const node of document) {
    visitNode(node, visit)
  }
}

function visitNode(node: XmlNode, visit: (name: string, node: XmlElementNode, attrs: XmlAttributes) => void): void {
  const entry = getElementEntry(node)
  if (!entry) {
    return
  }
  visit(entry.name, entry.node, entry.attrs)
  for (const child of entry.children) {
    visitNode(child, visit)
  }
}

export function getElementEntry(node: XmlNode): ElementEntry | null {
  if (isMetaNode(node)) {
    return null
  }
  const elementNode = node as XmlElementNode
  for (const [key, value] of Object.entries(elementNode)) {
    if (key === ':@' || key.startsWith('#')) {
      continue
    }
    if (!Array.isArray(value)) {
      continue
    }
    const attrs = elementNode[':@'] ?? {}
    return {
      name: key,
      node: elementNode,
      attrs,
      children: value as XmlNode[],
    }
  }
  return null
}

export function getRootElementEntry(document: XmlDocument): ElementEntry | null {
  for (const node of document) {
    const entry = getElementEntry(node)
    if (entry) {
      return entry
    }
  }
  return null
}

function isMetaNode(node: XmlNode): boolean {
  return '#text' in node || '#cdata' in node || '#comment' in node
}
