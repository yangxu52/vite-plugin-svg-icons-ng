import ids from 'virtual:svg-icons/ids'
import sprite from 'virtual:svg-icons/sprite'
import { renderApp } from './main'

const SPRITE_PLACEHOLDER_REGEX = /<div id="__svg__icons__dom__" data-svg-icons-placeholder><\/div>/

export async function render(url: string, template: string): Promise<string> {
  const appHtml = renderApp({
    url,
    symbolCount: ids.length,
  })

  return template.replace('<!--app-html-->', appHtml).replace(SPRITE_PLACEHOLDER_REGEX, sprite)
}
