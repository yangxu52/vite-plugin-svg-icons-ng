# 插件选项

插件选项可以传递给 `createSvgIconsPlugin` 方法.

## iconDirs

- 类型: `string[]`
- 必填: `true`

配置插件遍历用来生成 SVG精灵图 的 SVG文件 所在的文件夹。

示例：

```ts{3}
// ...
createSvgIconsPlugin({
  iconDirs: [path.resolve(process.cwd(), 'src/icons')],
})
// ...
```

> [!WARNING] 注意
> 虽然用文件夹路径来区分已经可以很大程度避免重名问题了，  
> 但是也会出现`iconDirs`配置多个文件夹，且存在文件名一样的 svg 。  
> 这需要开发者自己规避。

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
  iconDirs: [path.resolve(process.cwd(), 'src/icons')],
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

SVG 精灵图注入到 HTML 的位置。

> [!WARNING] 注意
> 该选项仅作用于 客户端渲染（CSR）自动注入。  
> 如果通过 `virtual:svg-icons/sprite` 手动注入（SSR 模板场景），`inject` 不生效。

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

控制编译阶段遇到错误 SVG 文件时的行为：

- `false`：输出告警并跳过该图标。
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
