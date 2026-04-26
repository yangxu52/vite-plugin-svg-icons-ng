import type { BakeIssue, ResolvedIdPolicyOptions } from '../types.ts'

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

export type AttributeReferenceId = {
  kind: ReferenceKind
  attrName: string
  targetIds: string[]
}

export type StyleReferenceId = {
  kind: 'style-selector' | 'style-url'
  textNode: XmlTextNode
  targetIds: string[]
}

export type ReferenceIdRecord = {
  element: ElementRecord
  attributeRefs: AttributeReferenceId[]
  styleRefs: StyleReferenceId[]
}

export type CollectResult = {
  root: XmlDocument
  elements: ElementRecord[]
  definedIds: Map<string, DefinedIdRecord[]>
  referenceIds: ReferenceIdRecord[]
  styleParseFailureCount: number
}

export type RewriteInputOptions = Pick<ResolvedIdPolicyOptions, 'unresolved' | 'idStyle' | 'delim'>

export type RewriteResult = {
  code: string
  idMap: Map<string, string>
  issues: BakeIssue[]
}
