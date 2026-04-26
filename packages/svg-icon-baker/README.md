# svg-icon-baker

> Bake the `svg` icon into `symbol` 🍪

The core library for transforming SVG icons into optimized SVG symbol sprites.

If you like this project, please give it a [Star](https://github.com/yangxu52/svg-icon-baker).

## Usage

```ts
import { bakeIcon, bakeIcons } from 'svg-icon-baker'

const source = { name: 'home', content: '<svg viewBox="0 0 16 16">...</svg>' }
const result = bakeIcon(source)
// result: { name: 'home', content: '<symbol id="home" viewBox="0 0 16 16">...</symbol>', issues: [] }

const results = bakeIcons([source])
```

`bakeIcon` and `bakeIcons` are synchronous.

## API

### `bakeIcon(source: BakeSource, options?: Options): BakeResult`

Convert one SVG into one symbol result.

### `bakeIcons(sources: BakeSource[], options?: Options): BakeResult[]`

Convert multiple SVG inputs with one inferred option set.

## Options

| name          | type              | default                                                                 | description                                      |
| ------------- | ----------------- | ----------------------------------------------------------------------- | ------------------------------------------------ |
| `optimize`    | `boolean`         | `true`                                                                  | Enable default safe SVGO optimization preset.    |
| `svgoOptions` | `SvgoOptions`     | `{}`                                                                    | Custom SVGO options into the optimization layer. |
| `idPolicy`    | `IdPolicyOptions` | `{ rewrite: true, unresolved: 'prefix', idStyle: 'named', delim: '_' }` | Sprite-safe local id rewriting behavior.         |

Notes:

- Behavior matrix:
  - `optimize: true` + no `svgoOptions`: run default safe optimization.
  - `optimize: true` + `svgoOptions`: run default safe optimization, then merge custom options.
  - `optimize: false` + no `svgoOptions`: skip optimization layer.
  - `optimize: false` + `svgoOptions`: run custom optimization settings only.
- When `svgoOptions.plugins` is provided, custom plugins run after default safe optimization plugins.
- `svg-icon-baker` always appends its own `removeDimensions` pass.
- User-supplied `prefixIds` and `cleanupIds` plugins are filtered out. This is intentional:
  `preset-default` already includes `cleanupIds`, and the package keeps one authoritative internal
  sprite id rewrite flow.

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
  issues: BakeIssue[]
}

type BakeIssue = {
  level: 'warning' | 'error'
  code: 'unresolved-reference' | 'duplicate-definition' | 'unsupported-reference-carrier' | 'style-parse-failed' | 'prune-skipped'
  message: string
  targetId?: string
}

type SvgoOptions = Pick<Config, 'multipass' | 'floatPrecision' | 'js2svg' | 'plugins'>

type IdPolicyOptions = {
  rewrite?: boolean
  unresolved?: 'prefix' | 'preserve'
  idStyle?: 'named' | 'minified' | 'hashed'
  delim?: '-' | '_'
}

type Options = {
  optimize?: boolean
  svgoOptions?: SvgoOptions
  idPolicy?: IdPolicyOptions
}
```

## Features

- Optimization: Reduce file size, and improve efficiency through `SVGO`
- Reference Handling: ID and reference prefixing for sprite safety
- Reporting: unresolved and duplicate local id issues are exposed through `issues` without forcing a throw
- Size Unify: `viewBox` preservation or inference from root dimensions

## SVGO v4 Notes

- `prefixIds` in SVGO v4 rewrites element ids, `href`/`xlink:href`, `url(#...)`, style selectors,
  and SMIL `begin`/`end` references.
- `cleanupIds` in SVGO v4 can remove unused ids and minify referenced ids.
- Because `preset-default` includes `cleanupIds`, `svg-icon-baker` keeps `prefixIds` as the final
  id-related plugin in the pipeline.

## License

MIT © [yangxu52](https://github.com/yangxu52/svg-icon-baker/blob/main/LICENSE)
