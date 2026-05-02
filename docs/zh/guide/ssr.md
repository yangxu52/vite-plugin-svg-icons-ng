# 服务端渲染（SSR）

SSR 场景下的使用方式。

## 核心原则

- 标准 Vite HTML 流程下，插件会按 `htmlMode` 生成 HTML。
- `inline`：直接注入 sprite 标记。
- `script`：运行时挂载，并在开发环境下保持更新可用。
- `virtual:svg-icons/register`：可选，仅在需要从客户端代码显式挂载时使用，推荐同时设置 `htmlMode: 'none'`。
- SSR 情况：如果最终 HTML 是由你的服务端代码拼接输出，需要手动注入 sprite。
- SSR 开发模式下，`virtual:svg-icons/sprite` 与 dev HMR 使用同一份编译状态，图标变更后的下一次服务端渲染会读取最新 sprite。

## 场景判断

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

| 场景                                          | 是否需要手动注入 sprite  | 建议做法                                                                                                                    |
| --------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| 标准 Vite 应用（CSR）                         | 否（由插件流程处理）     | 选择 `htmlMode: 'script'` 或 `htmlMode: 'inline'`。如果使用 `virtual:svg-icons/register`，推荐同时设置 `htmlMode: 'none'`。 |
| 自建 SSR 服务（Express/<br />Koa/Fastify 等） | 是（需要手动拼装HTML）   | 在服务端渲染入口导入 `virtual:svg-icons/sprite`，并注入模板。                                                               |
| 框架 SSR（Nuxt 等）                           | 通常是（使用钩子或同上） | 在框架提供的服务端 HTML 钩子/模板流程中注入 sprite。                                                                        |

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
- 在 SSR 开发模式下，`virtual:svg-icons/sprite` 会在下一次服务端渲染响应中返回最新 sprite。
- 如果 SSR 层对完整 HTML/模板做了激进缓存，请在图标变更后主动失效缓存。

## 相关虚拟模块

- `virtual:svg-icons/register`：可选的客户端挂载模块。
- `virtual:svg-icons/sprite`：用于 SSR 模板注入的 sprite 字符串。
- `virtual:svg-icons/ids`：导出当前全部 symbol id。
