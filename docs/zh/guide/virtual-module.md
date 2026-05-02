# 虚拟模块

插件提供了几个虚拟模块，分别用于不同的使用场景。

## `virtual:svg-icons/register`

如果你需要从客户端代码中挂载生成后的 sprite，可在 `src/main.ts` 这类入口中导入这个模块。

在开发环境下，挂载后的 sprite 会随着图标变更自动更新。

这个模块是可选的。默认的 `htmlMode: 'inline'` 会把 sprite 注入 HTML；`htmlMode: 'script'` 也会自动挂载。使用 `virtual:svg-icons/register` 时，推荐将 `htmlMode` 设为 `none`，关闭自动 HTML 注入。

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
