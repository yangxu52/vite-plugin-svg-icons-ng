# 虚拟模块

插件提供了几个虚拟模块，分别用于不同的使用场景。

## `virtual:svg-icons/register`

开发环境中，如果需要从客户端入口挂载生成后的 sprite，可在 `src/main.ts` 这类入口中导入这个模块。

它同时会监听图标 HMR 更新，并直接替换页面中现有的 sprite DOM：

```ts
import 'virtual:svg-icons/register'
```

## `virtual:svg-icons/ids`

通过该模块读取当前全部 symbol id：

> [!TIP] 提示
> 这些值是 sprite 中实际生成的 `<symbol id="...">`。在业务代码里，也可以把它理解为模板中 `<use href="#...">` 要引用的“图标名称”。

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

## 已废弃别名

以下别名当前仍保留兼容，但已废弃，并计划在 `v2.0.0` 移除：

- `virtual:svg-icons-register` -> `virtual:svg-icons/register`
- `virtual:svg-icons-names` -> `virtual:svg-icons/ids`

升级到 `v2.0.0` 前，请先迁移到基于斜杠的新虚拟模块 id。
