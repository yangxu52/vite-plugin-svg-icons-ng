# svg-icon-baker

> Bake the `svg` icon into `symbol` 🍪

`svg-icon-baker` is the core library for transforming SVG icons into optimized SVG symbol sprites.
It converts SVG content into `<symbol>` markup for SVG sprite usage while preserving structure and handling local id references safely across multiple icons.

## Installation

```bash
pnpm add svg-icon-baker
```

## Usage

```ts
import { bakeIcon, bakeIcons, createBaker } from 'svg-icon-baker'

const source = {
  name: 'icon-home',
  content: '<svg viewBox="0 0 16 16"><path d="..."/></svg>',
}

const result = bakeIcon(source)

console.log(result)
// {
//   name: 'icon-home',
//   content: '<symbol id="icon-home" viewBox="0 0 16 16">...</symbol>',
//   issues: []
// }

const batch = bakeIcons([source])

const baker = createBaker({
  idPolicy: { idStyle: 'named', delim: '_' },
})

const reused = baker.bakeIcon(source)
```

`bakeIcon`, `bakeIcons`, and `createBaker(...).bakeIcon()` are synchronous.

## API

### `bakeIcon(source: BakeSource, options?: Options): BakeResult`

Convert one SVG input into one symbol result.

### `bakeIcons(sources: BakeSource[], options?: Options): BakeResult[]`

Convert multiple SVG inputs with one resolved option set.

### `createBaker(options?: Options): Baker`

Create a reusable baker instance with one resolved option set.
This is the preferred API when the same options are applied to many icons.

```ts
type Baker = {
  bakeIcon(source: BakeSource): BakeResult
  bakeIcons(sources: BakeSource[]): BakeResult[]
}
```

## Return Value

```ts
type BakeResult = {
  name: string
  content: string
  issues: BakeIssue[]
}
```

- `name` is the original source name.
- `content` is the generated `<symbol>...</symbol>` markup.
- `issues` contains non-fatal diagnostics. Conversion still succeeds when issues are reported.

## Options

| name          | type              | default                                                                    | description                                  |
| ------------- | ----------------- | -------------------------------------------------------------------------- | -------------------------------------------- |
| `optimize`    | `boolean`         | `true`                                                                     | Enable the built-in safe SVGO optimization.  |
| `svgoOptions` | `SvgoOptions`     | `{}`                                                                       | Merge custom SVGO options into optimization. |
| `idPolicy`    | `IdPolicyOptions` | `{ rewrite: true, unresolved: 'prefix', idStyle: 'minified', delim: '_' }` | Control local id rewriting for sprite use.   |

### `idPolicy`

```ts
type IdPolicyOptions = {
  rewrite?: boolean
  unresolved?: 'prefix' | 'preserve'
  idStyle?: 'named' | 'minified' | 'hashed'
  delim?: '-' | '_'
}
```

| name         | type                                | default      | description                                                                                                                          |
| ------------ | ----------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `rewrite`    | `boolean`                           | `true`       | Rewrite local ids and local references for sprite safety.                                                                            |
| `unresolved` | `'prefix' \| 'preserve'`            | `'prefix'`   | For unresolved local references, either rewrite them into the icon namespace or keep them unchanged. Both behaviors report an issue. |
| `idStyle`    | `'named' \| 'minified' \| 'hashed'` | `'minified'` | Choose readable ids such as `icon_home`, short ids such as `icon_a`, or hashed ids such as `icon_dgxZM` (base62 characters).         |
| `delim`      | `'-' \| '_'`                        | `'_'`        | Separator between the icon name and the generated id part.                                                                           |

## Diagnostics

### Issues

```ts
type BakeIssue = {
  code: 'ResolveReferenceFailed' | 'DetectDefinitionDuplicate' | 'DetectReferenceCarrierUnsupported' | 'ParseStyleFailed'
  message: string
  targetId?: string
}
```

Issues are returned in `BakeResult.issues` instead of throwing.
Currently emitted issue codes include:

- unresolved local references
- duplicate local definitions
- style content that cannot be safely parsed

`ParseStyleFailed` means one or more `<style>` blocks could not be safely parsed.
In that case, the original style content is preserved and conversion still succeeds.

`DetectReferenceCarrierUnsupported` is reserved for unsupported local reference carriers.
It is part of the public type contract, but it is not currently emitted by the implementation.

Example:

```ts
const result = bakeIcon(
  {
    name: 'icon-alert',
    content: '<svg viewBox="0 0 16 16"><use href="#ghost"/></svg>',
  },
  {
    idPolicy: { unresolved: 'preserve' },
  }
)

console.log(result.issues)
// [
//   {
//     code: 'ResolveReferenceFailed',
//     message: 'Resolve reference failed for local target "ghost"; reference was preserved.',
//     targetId: 'ghost'
//   }
// ]
```

### Errors

Fatal failures throw `BakeError`.

```ts
class BakeError extends Error {
  code: 'ValidateSourceInvalid' | 'ValidateNameInvalid' | 'ValidateSvgRootInvalid' | 'ParseSvgFailed' | 'OptimizeSvgFailed' | 'ResolveViewBoxFailed'
  cause?: unknown
}
```

Typical fatal cases:

- missing `name` or `content`
- invalid icon names
- input that does not start with an `<svg>` root
- malformed SVG that cannot be parsed for rewriting
- SVGO plugin failures
- output where `viewBox` cannot be determined

## SVGO Behavior

`svg-icon-baker` uses SVGO as an optimization layer after conversion preparation.

- When `optimize` is `true`, the package applies a built-in safe preset.
- User `svgoOptions` are merged into that optimization step.
- `removeDimensions` is always applied so the output keeps `viewBox` as the sizing contract.
- User-supplied `prefixIds` and `cleanupIds` plugins are ignored to keep id rewriting behavior stable.

This means local id handling is controlled through `idPolicy`, not through external SVGO id plugins.

## Output Guarantees

On success, the output keeps these behaviors:

- the root is always `<symbol>...</symbol>`
- the symbol root `id` equals `source.name`
- `viewBox` is required in the final output
- root `width` and `height` are removed
- non-structural root attributes such as `fill` are preserved
- XML declarations, BOM, comments, and doctype preamble are stripped

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
  code: 'ResolveReferenceFailed' | 'DetectDefinitionDuplicate' | 'DetectReferenceCarrierUnsupported' | 'ParseStyleFailed'
  message: string
  targetId?: string
}

type BakeErrorCode =
  | 'ValidateSourceInvalid'
  | 'ValidateNameInvalid'
  | 'ValidateSvgRootInvalid'
  | 'ParseSvgFailed'
  | 'OptimizeSvgFailed'
  | 'ResolveViewBoxFailed'

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

## License

MIT © [yangxu52](https://github.com/yangxu52/svg-icon-baker/blob/main/LICENSE)
