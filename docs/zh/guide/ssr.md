# 服务端渲染（SSR）

SSR 场景下的使用方式。

## 核心原则

- 默认情况：在标准 Vite HTML 流程下，sprite 会自动注入。
- SSR 情况：如果最终 HTML 是由你的服务端代码拼接输出，需要手动注入 sprite。

## 场景判断

| 场景                                    | 是否需要手动注入 sprite | 建议做法                                                      |
| --------------------------------------- | ----------------------- | ------------------------------------------------------------- |
| 标准 Vite 应用（CSR）                   | 否                      | 按常规方式使用插件即可。                                      |
| 自建 SSR 服务（Express/Koa/Fastify 等） | 是                      | 在服务端渲染入口导入 `virtual:svg-icons/sprite`，并注入模板。 |
| 框架 SSR（Nuxt 等）                     | 通常是                  | 在框架提供的服务端 HTML 钩子/模板流程中注入 sprite。          |

## SSR 示例

```ts
// entry-server.ts
import sprite from 'virtual:svg-icons/sprite'

export async function render(url: string, template: string) {
  // 1) 使用你的 SSR 框架渲染应用 HTML
  const appHtml = '<!-- app html -->'
  const withApp = template.replace('<!--app-html-->', appHtml)

  // 2) 在 </body> 前注入 sprite
  return withApp.replace('</body>', `${sprite}</body>`)
}
```

## SSR 开发模式下的 HMR

- SVG 文件变更后，插件会更新 sprite 输出。
- 在 SSR 开发模式下，新的 sprite 应该体现在下一次服务端渲染响应中。
- 如果 SSR 层对完整 HTML/模板做了激进缓存，请在图标变更后主动失效缓存。

## 相关虚拟模块

- `virtual:svg-icons/sprite`：用于 SSR 模板注入的 sprite 字符串。
- `virtual:svg-icons/ids`：导出当前全部 symbol id。
