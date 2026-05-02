# Server-Side Rendering (SSR)

This page focuses on practical usage in SSR apps.

## Rule of Thumb

- Default Vite HTML flow follows `htmlMode`.
- `inline`: inject sprite markup into HTML.
- `script`: mount at runtime and keep updates working in dev.
- `virtual:svg-icons/register`: optional; use it only for explicit client-side mount, and prefer `htmlMode: 'none'`.
- SSR behavior: if your server builds the final HTML response itself, inject sprite manually.
- In SSR dev, `virtual:svg-icons/sprite` reads from the same compiler state as dev HMR, so the next server render gets the latest sprite after icon changes.

## Decision Table

<style>
table th:first-of-type {
    width: 30%;
}
table th:nth-of-type(2) {
    width: 30%;
}
table th:nth-of-type(3) {
    width: 40%;
}
</style>

| Scenario                                            | Do I inject sprite manually?    | What to do                                                                                                               |
| --------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Standard Vite app (CSR)                             | No (handled by the plugin flow) | Choose `htmlMode: 'script'` or `htmlMode: 'inline'`. If you use `virtual:svg-icons/register`, prefer `htmlMode: 'none'`. |
| Custom SSR server (Express/<br />Koa/Fastify, etc.) | Yes (you assemble HTML)         | Import `virtual:svg-icons/sprite` in server render and inject into template HTML.                                        |
| Framework SSR (Nuxt, etc.)                          | Usually yes                     | Inject sprite in the framework's server HTML hook/template pipeline.                                                     |

## SSR Example

```ts
// entry-server.ts
import sprite from 'virtual:svg-icons/sprite'

export async function render(url: string, template: string) {
  // 1) render app html with your SSR framework
  const appHtml = '<!-- app html -->'
  const withApp = template.replace('<!--app-html-->', appHtml)

  // 2) inject sprite before </body>
  return withApp.replace('</body>', `${sprite}</body>`)
}
```

## HMR in SSR Dev

- When an SVG file changes, the plugin updates sprite output.
- In SSR dev mode, `virtual:svg-icons/sprite` returns the latest sprite on the next server-rendered response.
- If your SSR layer caches full HTML/template aggressively, invalidate that cache after icon changes.

## Related Virtual Modules

- `virtual:svg-icons/register`: optional client-side module for explicit sprite mounting.
- `virtual:svg-icons/sprite`: sprite string for SSR template injection.
- `virtual:svg-icons/ids`: all generated symbol ids.
