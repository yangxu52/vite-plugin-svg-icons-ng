# svg-icon-baker

> Bake the `svg` icon into `symbol` 🍪

The core library for transforming SVG icons into optimized SVG symbol sprites.

If you like this project, please give it a [Star](https://github.com/yangxu52/svg-icon-baker).

## Usage

```ts
import { bakeIcon, bakeIcons } from 'svg-icon-baker'

const source = { name: 'home', content: '<svg viewBox="0 0 16 16">...</svg>' }
const result = bakeIcon(source)
// result: { name: 'home', content: '<symbol id="home" viewBox="0 0 16 16">...</symbol>' }

const results = bakeIcons([source])
```

`bakeIcon` and `bakeIcons` are synchronous.

## API

### `bakeIcon(source: BakeSource, options?: Options): BakeResult`

Convert one SVG into one symbol result.

### `bakeIcons(sources: BakeSource[], options?: Options): BakeResult[]`

Convert multiple SVG inputs with one inferred option set.

## Options

| name          | type          | default | description                                      |
| ------------- | ------------- | ------- | ------------------------------------------------ |
| `optimize`    | `boolean`     | `true`  | Enable default safe SVGO optimization preset.    |
| `svgoOptions` | `SvgoOptions` | `{}`    | Custom SVGO options into the optimization layer. |

Notes:

- Behavior matrix:
  - `optimize: true` + no `svgoOptions`: run default safe optimization.
  - `optimize: true` + `svgoOptions`: run default safe optimization, then merge custom options.
  - `optimize: false` + no `svgoOptions`: skip optimization layer.
  - `optimize: false` + `svgoOptions`: run custom optimization settings only.
- When `svgoOptions.plugins` is provided, custom plugins run after default safe optimization plugins.

## Type Definitions

```ts
import type { Config } from 'svgo'

type BakeSource = {
  name: string
  content: string
}

type BakeResult = {
  name: string
  content: string
}

type SvgoOptions = Pick<Config, 'multipass' | 'floatPrecision' | 'js2svg' | 'plugins'>

type Options = {
  optimize?: boolean
  svgoOptions?: SvgoOptions
}
```

## Features

- Optimization: Reduce file size, and improve efficiency through `SVGO`
- Reference Handling: ID and reference prefixing for sprite safety
- Size Unify: `viewBox` preservation or inference from root dimensions

## License

MIT © [yangxu52](https://github.com/yangxu52/svg-icon-baker/blob/main/LICENSE)
