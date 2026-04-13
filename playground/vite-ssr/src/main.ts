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
  <h1>Playground - Vite SSR</h1>
  <p id="route">Route: ${escapeHtml(ctx.url)}</p>
  <p id="symbol-count">Symbol count: ${ctx.symbolCount}</p>
  <p id="client-ready">Client status: waiting</p>
  <svg width="48" height="48" role="img" aria-label="icon preview">
    <use xlink:href="#icon-home"></use>
  </svg>
</main>`
}
