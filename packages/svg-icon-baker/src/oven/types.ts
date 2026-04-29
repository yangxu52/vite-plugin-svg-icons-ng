import type { ResolvedIdPolicyOptions } from '../types.ts'

export type XmlAttributes = Record<string, string>

export type XmlTextNode = {
  '#text': string
}

export type XmlCDataNode = {
  '#cdata': string
}

export type XmlCommentNode = {
  '#comment': string
}

export type XmlMetaNode = XmlTextNode | XmlCDataNode | XmlCommentNode

export type XmlElementNode = {
  ':@'?: XmlAttributes
} & Record<string, unknown>

export type XmlNode = XmlElementNode | XmlMetaNode

export type XmlDocument = XmlNode[]

export type ElementEntry = {
  name: string
  node: XmlElementNode
  attrs: XmlAttributes
  children: XmlNode[]
}

export type ElementRecord = {
  name: string
  node: XmlElementNode
  attrs: XmlAttributes
}

export type DefinedIdRecord = {
  id: string
  attrName: 'id' | 'xml:id'
  element: ElementRecord
  order: number
}

export type ReferenceKind = 'href' | 'url' | 'begin' | 'end' | 'aria-labelledby' | 'aria-describedby' | 'style-selector' | 'style-url' | 'style-attr'

export type AttributeReference = {
  kind: ReferenceKind
  attrName: string
  targetIds: string[]
}

export type StyleReference = {
  kind: 'style-selector' | 'style-url'
  textNode: XmlTextNode
  targetIds: string[]
}

export type ElementReferences = {
  element: ElementRecord
  attributeRefs: AttributeReference[]
  styleRefs: StyleReference[]
}

export type IdCollection = {
  document: XmlDocument
  elements: ElementRecord[]
  definedIds: Map<string, DefinedIdRecord[]>
  referenceIds: ElementReferences[]
  styleParseFailureCount: number
}

export type RewriteOptions = Pick<ResolvedIdPolicyOptions, 'unresolved' | 'idStyle' | 'delim'>
