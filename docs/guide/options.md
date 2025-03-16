# Plugin Options

plugin options can be passed to the `createSvgIconsPlugin` function.

## iconDirs

- type: `string[]`
- required: `true`

Specify which folders the plugin can search for SVG files to generate SVG sprite.

Example:

```ts{3}
// ...
createSvgIconsPlugin({
  iconDirs: [path.resolve(process.cwd(), 'src/icons')],
})
// ...
```

> [!WARNING] NOTE
> Although the use of folders to distinguish between them can largely avoid the problem of duplicate names,
> there will also be svgs with multiple folders and the same file name in `iconDirs`.
> This needs to be avoided by the developer themselves.

## symbolId

- type: `string`
- default: `icon-[dir]-[name]`

The `id` attribute **format** of SVG sprite child node `<symbol>`.  
The option supports two types of placeholders, `[name]` and `[dir]`.

- `[name]`: the name of the svg file, **without extension**.
- `[dir]`: the **relative path** of the `iconDirs` folder to the owner svg file.

Example:

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

> [!WARNING] NOTE
> `symbolId` must be a valid ASCII `letter`, `number`, `underline`, `hyphen`,
> except for placeholder symbols, and starting with a `letter`!  
> `symbolId` must contain the `[name]` placeholder symbol, otherwise an error will be thrown.

## svgoOptions

- type: `SvgoOptions | false`
- default: `{}`

SVGO `optimize` configuration, details: [SVGO](https://github.com/svg/svgo#configuration),
or `false` to disable SVGO optimization.

> [!WARNING] NOTE
> If you don't know what this is, please do not override this option.

## inject

- type: `string`
- default: `body-last`
- options: `body-first` | `body-last`

The position of the SVG sprite inject into DOM.

## customDomId

- type: `string`
- default: `__svg__icons__dom__`

Customize the `id` attribute of the SVG sprite DOM.
