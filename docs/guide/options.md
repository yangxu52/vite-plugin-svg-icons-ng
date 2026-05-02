# Plugin Options

plugin options can be passed to the `createSvgIconsPlugin` function.

## iconDirs

- type: `string[]`
- required: `true`

Specify which folders the plugin can search for SVG files to generate SVG sprite.

- Relative paths are resolved from Vite [`root`](https://vite.dev/config/shared-options#root).
- Absolute paths are kept as-is, which is useful for shared icon folders in monorepos.

Example:

```ts{3}
// ...
createSvgIconsPlugin({
  iconDirs: ['src/icons'],
})
// ...
```

> [!WARNING] NOTE
> Duplicate generated `symbolId` values are detected during compile.
> By default, the plugin warns and skips later duplicates; set `failOnError: true` to fail the compile/build instead.

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

> [!WARNING] NOTE
> `symbolId` must be a valid ASCII `letter`, `number`, `underline`, `hyphen`,
> except for placeholder symbols, and starting with a `letter`!  
> `symbolId` must contain the `[name]` placeholder symbol, otherwise an error will be thrown.

## inject

- type: `string`
- default: `body-last`
- options: `body-first` | `body-last`

Control where the plugin inserts generated HTML output.

- `htmlMode: 'script'`: controls where the injected sprite script is placed, and where the mounted sprite is inserted in `document.body`.
- `htmlMode: 'inline'`: controls where the static sprite markup is injected into HTML.
- `htmlMode: 'none'`: no HTML is injected automatically.

> [!WARNING] NOTE
> This option only applies to the plugin-managed HTML flow.
> If you inject manually via `virtual:svg-icons/sprite` (for SSR templates), `inject` is not used.

## htmlMode

- type: `string`
- default: `inline`
- options: `script` | `inline` | `none`

Control how the plugin generates sprite-related HTML:

- `script`: inject a script that contains the sprite, then mount the sprite at runtime. In dev, sprite updates still work. Safer for complex SVGs such as `foreignObject`.
- `inline`: inject the full sprite markup directly into HTML during `transformIndexHtml`. This is the default mode.
- `none`: disable automatic HTML generation completely.

If you use `virtual:svg-icons/register`, prefer `htmlMode: 'none'` to disable automatic HTML injection.

## customDomId

- type: `string`
- default: `__svg__icons__dom__`

Customize the `id` attribute of injected sprite root `<svg>`.

## strokeOverride

- type: `boolean | string`
- default: `false`

Override `stroke` attribute, set `false` to disable it, set `true` to use `currentColor`, or specify a color.

## failOnError

- type: `boolean`
- default: `false`

Control how broken SVG files and duplicate generated `symbolId` values are handled during compile:

- `false`: warn and skip broken icons or later duplicate icons.
- `true`: throw immediately and fail the compile/build.

## bakerOptions

- type: `BakerOptions`
- default: `{}`

Pass options directly to customize the underlying `svg-icon-baker`.
Use this to customize baker behavior, including `SVGO` options.
See [svg-icon-baker options doc](https://www.npmjs.com/package/svg-icon-baker) for details.

> [!WARNING] NOTE
> If you don't know what this is, please do not override this option.  
> If you understand, configure this may improve effect for some "strange SVG", but it may introduce bigger issues.
> The best way is to modify the svg file itself
