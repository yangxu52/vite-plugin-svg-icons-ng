# Server-Side Rendering (SSR)

This page focuses on practical usage in SSR apps.

## Rule of Thumb

- Default behavior: sprite is injected automatically in normal Vite HTML flow.
- SSR behavior: if your server builds the final HTML response itself, inject sprite manually.

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

| Scenario                                            | Do I inject sprite manually?   | What to do                                                                        |
| --------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------- |
| Standard Vite app (CSR)                             | No (automatic injection works) | Use plugin normally.                                                              |
| Custom SSR server (Express/<br />Koa/Fastify, etc.) | Yes (you assemble HTML)        | Import `virtual:svg-icons/sprite` in server render and inject into template HTML. |
| Framework SSR (Nuxt, etc.)                          | Usually yes                    | Inject sprite in the framework's server HTML hook/template pipeline.              |

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
- In SSR dev mode, the updated sprite should appear in the next server-rendered response.
- If your SSR layer caches full HTML/template aggressively, invalidate that cache after icon changes.

## Related Virtual Modules

- `virtual:svg-icons/sprite`: sprite string for SSR template injection.
- `virtual:svg-icons/ids`: all generated symbol ids.
