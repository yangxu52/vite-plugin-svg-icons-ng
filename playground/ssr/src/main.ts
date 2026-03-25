type RenderContext = {
  url: string
  symbolCount: number
}

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => {
    if (char === '&') return '&amp;'
    if (char === '<') return '&lt;'
    if (char === '>') return '&gt;'
    if (char === '"') return '&quot;'
    return '&#39;'
  })
}

export function renderApp(ctx: RenderContext): string {
  return `<main>
  <h1>SSR Playground</h1>
  <p id="route">Route: ${escapeHtml(ctx.url)}</p>
  <p id="symbol-count">Symbol count: ${ctx.symbolCount}</p>
  <p id="client-ready">Client status: waiting</p>
  <svg width="42" height="42" role="img" aria-label="icon preview">
    <use xlink:href="#icon-home"></use>
  </svg>
</main>`
}
