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

function prefixInternalId(svg: HTMLElement, id: string) {
  // reflect oldId -> newId
  const idMap = new Map()
  // rename defs id
  for (const defs of svg.querySelectorAll('defs')) {
    for (const child of defs.children) {
      const oldId = child.getAttribute('id')
      if (oldId) {
        const newId = `${id}_${oldId}`
        child.setAttribute('id', newId)
        idMap.set(oldId, newId)
        // remove units attrs, it will cause error
        child.removeAttribute('maskUnits')
        child.removeAttribute('patternUnits')
        child.removeAttribute('gradientUnits')
        child.removeAttribute('clipPathUnits')
        child.removeAttribute('markerUnits')
        child.removeAttribute('filterUnits')
      }
    }
  }
  // replace id reference
  if (idMap.size > 0) {
    for (const el of svg.querySelectorAll('*')) {
      for (const [attrName, attrValue] of Object.entries(el.attributes)) {
        // xlink:href || href reference, example:`<use xlink:href="#xxx">`
        if ((attrName === 'xlink:href' || attrName === 'href') && attrValue.startsWith('#')) {
          const refId = attrValue.slice(1)
          if (idMap.has(refId)) {
            el.setAttribute('xlink:href', `#${idMap.get(refId)}`)
            el.setAttribute('href', `#${idMap.get(refId)}`)
          }
        }
        // url(#xxx) reference, example: mask、clip-path
        if (attrValue.indexOf('url(#') !== -1) {
          const newValue = attrValue.replace(/url\(#(.*?)\)/g, (match, refId) => {
            if (idMap.has(refId)) {
              return `url(#${idMap.get(refId)})`
            }
            return match
          })
          el.setAttribute(attrName, newValue)
        }
      }
    }
  }
}
