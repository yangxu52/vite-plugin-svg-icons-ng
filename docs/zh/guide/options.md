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
- default: `icon-[dir]-[name]`

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

## svgoOptions

- 类型: `SvgoOptions | false`
- default: `{}`

SVGO `optimize` 选项，详情：[SVGO](https://github.com/svg/svgo#configuration)，
或者覆盖 `false` 禁用 SVGO 相关优化。

> [!WARNING] 注意
> 如果你不知道这是什么，请不要覆盖这个选项。

## inject

- 类型: `string`
- default: `body-last`
- options: `body-first` | `body-last`

SVG精灵图的插入DOM的位置。

## customDomId

- 类型: `string`
- default: `__svg__icons__dom__`

自定义SVG精灵图的插入DOM节点的ID属性。

## strokeOverride

- 类型: `boolean | { color: string }`
- default: `false`

覆盖 `stroke` 属性，设置 `false` 禁用该功能，设置 `true` 为 `currentColor` 或者设置对象来自定义颜色。
