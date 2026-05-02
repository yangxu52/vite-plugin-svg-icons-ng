# 插件选项

插件选项可以传递给 `createSvgIconsPlugin` 方法.

## iconDirs

- 类型: `string[]`
- 必填: `true`

配置插件遍历用来生成 SVG精灵图 的 SVG文件 所在的文件夹。

- 相对路径 统一基于 Vite 配置选项 [`root`](https://cn.vite.dev/config/shared-options#root) 解析。
- 绝对路径 保持不变，适合 monorepo 中引用共享图标目录。

示例：

```ts{3}
// ...
createSvgIconsPlugin({
  iconDirs: ['src/icons'],
})
// ...
```

> [!WARNING] 注意
> 插件会在编译阶段检测重复生成的 `symbolId`。
> 默认行为是输出告警并跳过后出现的重复图标；设置 `failOnError: true` 后会直接抛错并中断编译/构建。

## symbolId

- 类型: `string`
- 默认值: `icon-[dir]-[name]`

SVG精灵图中的子节点 `<symbol>` 的 `id` 属性。  
选项值可以包含占位符 `[name]` 和 `[dir]`。

- `[name]`: SVG文件 的文件名, **不含扩展名**.
- `[dir]`: 配置的`iconDirs`文件夹到所含 SVG文件 的**相对路径**

示例：

```ts{3,4}
// ...
createSvgIconsPlugin({
  iconDirs: ['src/icons'],
  symbolId: 'icon-[dir]-[name]',
})
// ...
```

```
src/icons/
├── dir/
│ └── icon1.svg # icon-dir-icon1
├── icon1.svg # icon-icon1
└── icon2.svg # icon-icon2
```

> [!WARNING] 注意
> `symbolId` 除了占位符本身外，必须是合法的 ASCII `字母`、`数字`、`下划线`和`连字符`。  
> `symbolId` 必须包含 `[name]` 占位符， 否则会抛出错误。

## inject

- 类型: `string`
- 默认值: `body-last`
- 选项: `body-first` | `body-last`

控制插件生成的 HTML 内容插入位置。

- `htmlMode: 'script'`：控制包含 sprite 的注入脚本位置，以及挂载后 sprite 在 `document.body` 中的位置。
- `htmlMode: 'inline'`：控制静态 sprite 标记注入到 HTML 的位置。
- `htmlMode: 'none'`：插件不会自动注入 HTML。

> [!WARNING] 注意
> 该选项仅作用于插件管理的 HTML 生成流程。  
> 如果通过 `virtual:svg-icons/sprite` 手动注入（SSR 模板场景），`inject` 不生效。

## htmlMode

- 类型: `string`
- 默认值: `inline`
- 选项: `script` | `inline` | `none`

控制插件如何生成与 sprite 相关的 HTML：

- `script`：注入包含 sprite 的脚本，再在运行时挂载 sprite。开发环境下图标更新仍然可用，也更适合包含 `foreignObject` 的复杂 SVG。
- `inline`：在 `transformIndexHtml` 阶段直接把完整 sprite 标记注入 HTML。这是默认模式。
- `none`：完全关闭自动 HTML 生成。

使用 `virtual:svg-icons/register` 时，推荐将 `htmlMode` 设为 `none`，关闭自动 HTML 注入。

## customDomId

- 类型: `string`
- 默认值: `__svg__icons__dom__`

自定义注入的精灵的根节点 `<svg>` 的 `id` 属性。

## strokeOverride

- 类型: `boolean | string`
- 默认值: `false`

覆盖 `stroke` 属性，设置 `false` 禁用该功能，设置 `true` 为 `currentColor` 或者自定义颜色。

## failOnError

- 类型: `boolean`
- 默认值: `false`

控制编译阶段遇到错误 SVG 文件或重复生成 `symbolId` 时的行为：

- `false`：输出告警并跳过错误图标或后出现的重复图标。
- `true`：立即抛错并使编译/构建失败。

## bakerOptions

- 类型: `BakerOptions`
- 默认值: `{}`

该选项会直接传递给底层 `svg-icon-baker`。
可用于完整自定义 baker 行为，包括 `SVGO` 配置项。
更多详情请参阅 [svg-icon-baker 选项文档](https://www.npmjs.com/package/svg-icon-baker)。

> [!WARNING] 注意
> 如果你不知道这是什么，请不要覆盖此选项。  
> 如果你清楚原理，配置它可能会改善某些“奇怪的SVG”的效果，但它可能会引发更大的问题。
> 最好的办法是修改SVG文件本身。
