import type { Options } from '../types'

export function generateSymbolId(filePath: string, options: Required<Options>) {
  const { symbolId } = options
  const { dir, name } = splitPath(filePath)
  return renderSymbolIdTemplate(symbolId, { dir, name })
}

export function renderSymbolIdTemplate(symbolId: string, placeholder: { dir: string; name: string }) {
  return symbolId
    .replace(/\[dir]/g, placeholder.dir)
    .replace(/\[name]/g, placeholder.name)
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * split path to `dir` and `name`
 */
export function splitPath(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/')
  const lastSlash = normalized.lastIndexOf('/')
  const dirPart = lastSlash > 0 ? normalized.slice(0, lastSlash) : ''
  const filePart = lastSlash >= 0 ? normalized.slice(lastSlash + 1) : normalized

  const dir = dirPart ? dirPart.split('/').filter(Boolean).join('-') : ''
  const dotIndex = filePart.lastIndexOf('.')
  const name = dotIndex > 0 ? filePart.slice(0, dotIndex) : filePart.startsWith('.') ? filePart : filePart

  return { dir, name }
}
