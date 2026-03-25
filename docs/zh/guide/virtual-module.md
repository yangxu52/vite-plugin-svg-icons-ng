# 虚拟模块

插件提供了几个虚拟模块，分别用于不同的使用场景。

## `virtual:svg-icons/register`

默认情况下，插件会自动把 sprite 注入到页面中。
如果你希望从客户端入口显式控制这一步，例如在 `src/main.ts` 中统一处理初始化流程，也可以手动导入：

```ts
import 'virtual:svg-icons/register'
```

## `virtual:svg-icons/ids`

通过该模块读取当前全部 symbol id：

```ts
import ids from 'virtual:svg-icons/ids'

console.log(ids)
// ['icon-icon1', 'icon-icon2', 'icon-dir-icon1', ...]
```

适用于图标选择器、后台配置页、动态渲染图标等场景。

## `virtual:svg-icons/sprite`

在 SSR 或需要手动拼接 HTML 的场景下，可以读取完整 sprite 字符串：

```ts
import sprite from 'virtual:svg-icons/sprite'
```

详细用法见 [服务端渲染（SSR）](/zh/guide/ssr)。
