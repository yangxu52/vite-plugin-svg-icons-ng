import { getRootElementEntry } from './xml.ts'
import type { XmlAttributes, XmlDocument } from './types.ts'

export function rewriteRoot(document: XmlDocument, symbolId: string): void {
  const rootEntry = getRootElementEntry(document)
  if (!rootEntry || rootEntry.name !== 'svg') {
    throw new Error('Input must start with an <svg> root element.')
  }
  const viewBox = resolveViewBox(rootEntry.attrs)
  if (!viewBox) {
    throw new Error('Cannot determine viewBox. Provide an SVG with viewBox or width/height attributes.')
  }

  const children = rootEntry.node[rootEntry.name]
  delete rootEntry.node[rootEntry.name]
  rootEntry.node.symbol = children
  rootEntry.attrs.id = symbolId
  rootEntry.attrs.viewBox = viewBox
  delete rootEntry.attrs.width
  delete rootEntry.attrs.height
}

function resolveViewBox(attrs: XmlAttributes): string | null {
  const explicitViewBox = attrs.viewBox?.trim()
  if (explicitViewBox) {
    return explicitViewBox
  }
  const width = resolveDimension(attrs.width)
  const height = resolveDimension(attrs.height)
  if (width == null || height == null) {
    return null
  }
  return `0 0 ${width} ${height}`
}

function resolveDimension(value: string | undefined): string | null {
  if (!value) {
    return null
  }
  const normalized = value.trim()
  if (/^-?\d+(?:\.\d+)?$/.test(normalized)) {
    return String(Number(normalized))
  }
  if (/^-?\d+(?:\.\d+)?px$/i.test(normalized)) {
    return String(Number(normalized.slice(0, -2)))
  }
  return null
}
