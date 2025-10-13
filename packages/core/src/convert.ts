import type { HTMLElement } from 'node-html-parser'
import { parse } from 'node-html-parser'

export function convertSvgToSymbol(id: string, content: string) {
  // parse svg
  const root = parse(content)
  const svg = root.querySelector('svg')
  if (!svg) {
    throw new Error('Invalid SVG content, missing <svg> element.')
  }
  // remove useless attrs
  removeUselessAttrs(svg)
  // unify size to viewBox
  unifySizeToViewBox(svg)
  // prefix internal id
  prefixInternalId(svg, id)
  svg.tagName = 'symbol'
  svg.setAttribute('id', id)
  return svg.toString()
}

function removeUselessAttrs(svg: HTMLElement) {
  svg.removeAttribute('xmlns')
  svg.removeAttribute('xmlns:xlink')
  svg.removeAttribute('class')
  svg.removeAttribute('style')
  svg.removeAttribute('role')
  svg.removeAttribute('aria-hidden')
}

function unifySizeToViewBox(svg: HTMLElement) {
  const { viewBox, width, height } = svg.attributes
  if (!viewBox && width && height) {
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  }
  svg.removeAttribute('width')
  svg.removeAttribute('height')
}

function prefixInternalId(svg: HTMLElement, prefix: string) {
  // reflect oldId -> newId
  const idMap = new Map<string, string>()

  // prefix the id attribute value
  svg.querySelectorAll('[id]').forEach((element) => {
    const oldId = element.getAttribute('id')
    if (oldId) {
      const newId = `${prefix}_${oldId}`
      idMap.set(oldId, newId)
      element.setAttribute('id', newId)
    }
  })

  // prefix the class attribute value
  svg.querySelectorAll('[class]').forEach((element) => {
    const oldClasses = element.getAttribute('class')?.split(/\s+/) || []
    if (oldClasses.length > 0) {
      const newClasses = oldClasses.map((className) => `${prefix}_${className}`)
      element.setAttribute('class', newClasses.join(' '))
    }
  })

  // prefix the href attribute value, and xlink:href
  const updateHref = (element: HTMLElement, attrName: string) => {
    const href = element.getAttribute(attrName)
    if (href?.startsWith('#')) {
      const refId = href.slice(1)
      if (idMap.has(refId)) {
        element.setAttribute(attrName, `#${idMap.get(refId)}`)
      }
    }
  }
  svg.querySelectorAll('[href], [xlink\\:href]').forEach((element) => {
    if (element.hasAttribute('href')) updateHref(element, 'href')
    if (element.hasAttribute('xlink:href')) updateHref(element, 'xlink:href')
  })

  // prefix the url() attribute value
  svg.querySelectorAll('*').forEach((element) => {
    Object.entries(element.attributes).forEach(([name, value]) => {
      if (value.includes('url(#')) {
        const newValue = value.replace(/url\(#([^)]+)\)/g, (match, id) => {
          return idMap.has(id) ? `url(#${idMap.get(id)})` : match
        })
        element.setAttribute(name, newValue)
      }
    })
  })
}
