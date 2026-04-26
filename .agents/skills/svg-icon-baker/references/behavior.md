# Behavior Reference

## Architecture

- Workspace package: `packages/svg-icon-baker`
- Module format: ESM only
- Build tool: `unbuild`
- Runtime dependency: `svgo ^4.0.1`
- Declarations: enabled
- CommonJS emission: disabled
- Engine constraints: Node `^18 || ^20 || >=22`

## Ownership

- `src/index.ts` owns exports only.
- `src/types.ts` owns public and shared type contracts.
- `src/options.ts` owns option normalization and SVGO plugin composition.
- `src/baker.ts` owns validation, rewrite orchestration, optimization execution, and symbol-root rewriting.
- `src/oven/parse.ts` owns XML parse/build helpers.
- `src/oven/collect.ts` owns local definition/reference discovery.
- `src/oven/rewrite.ts` owns sprite-local id mapping, rewrite execution, and issue collection.
- `src/oven/types.ts` owns internal rewrite data contracts.

## Public API

Current exports from `packages/svg-icon-baker/src/index.ts`:

- `bakeIcon`
- `bakeIcons`
- `BakeError`
- `Options`
- `BakeSource`
- `BakeResult`
- `BakeIssue`
- `BakeIssueCode`
- `BakeErrorCode`
- `IdPolicyOptions`
- `SvgoOptions`

Current result shape:

```ts
type BakeResult = {
  name: string
  content: string
  issues: BakeIssue[]
}
```

Current option shape:

```ts
type Options = {
  optimize?: boolean
  svgoOptions?: Pick<Config, 'multipass' | 'floatPrecision' | 'js2svg' | 'plugins'>
  idPolicy?: {
    rewrite?: boolean
    unresolved?: 'prefix' | 'preserve'
    idStyle?: 'named' | 'minified' | 'hashed'
    delim?: '-' | '_'
  }
}
```

Current issue and error model:

```ts
type BakeIssue = {
  code: 'ResolveReferenceFailed' | 'DetectDefinitionDuplicate' | 'DetectReferenceCarrierUnsupported' | 'ParseStyleFailed'
  message: string
  targetId?: string
}

class BakeError extends Error {
  code: 'ValidateSourceInvalid' | 'ValidateNameInvalid' | 'ValidateSvgRootInvalid' | 'ParseSvgFailed' | 'OptimizeSvgFailed' | 'ResolveViewBoxFailed'
  cause?: unknown
}
```

## Processing Model

`baker.ts` is split into two layers:

1. `resolveOptions` in `options.ts`
2. `convertToSymbol` and `toSymbolRootTag` in `baker.ts`

`bakeIcons` resolves options once per batch, then applies the same option set per source.

When `idPolicy.rewrite` is enabled, `convertToSymbol` runs internal sprite rewrite before SVGO:

1. collect local `definedIds`
2. build stable `idMap`
3. rewrite local references against the same map
4. surface non-fatal rewrite diagnostics through `issues`

This model is the authoritative sprite namespace layer. SVGO does not own sprite id naming semantics.

## SVGO Composition

`createSvgoConfig` currently builds plugins in this order:

1. `preset-default` with selected unsafe transforms disabled when `optimize: true`
2. extra safe plugins: `removeTitle`, `removeXMLNS`, `removeXlink`
3. user `svgoOptions.plugins`, except blocked plugins
4. core plugins:
   - `removeDimensions`

This ordering is intentional.

### Why `prefixIds` and `cleanupIds` are blocked

- sprite naming semantics now live in internal rewrite, not in SVGO plugins
- user-supplied `prefixIds` is filtered out so external passes cannot override the kernel namespace model
- user-supplied `cleanupIds` is filtered out so cleanup cannot re-own id naming, minification, or deletion semantics
- `preset-default` still exists, but its `cleanupIds` entry is explicitly disabled in the safe preset

### What the internal rewrite covers

Current rewrite targets include:

- element `id` and `xml:id`
- `href` and `xlink:href`
- URL references like `url(#foo)`
- selectors and URL references inside `<style>`
- SMIL `begin` and `end` references like `a.begin`, `b.end-0.5s`
- token list references in `aria-labelledby` and `aria-describedby`

Unresolved local references follow one policy:

- `prefix`: rewrite using the configured `idStyle`
- `preserve`: keep the original token and report an issue when applicable

Current `idStyle` output forms are:

- `named`: `${symbolId}${delim}${sourceId}`
- `minified`: `${symbolId}${delim}${a...}`
- `hashed`: `${symbolId}${delim}${hash(sourceId)}`

## Conversion Pipeline

1. validate `source`, `source.name`, and `source.content`
2. validate name syntax with `^[A-Za-z][A-Za-z0-9_-]*$`
3. strip BOM, XML declaration, comments, and doctype preamble
4. validate input still starts with `<svg>`
5. run internal id rewrite when `idPolicy.rewrite !== false`
6. run `optimize(rewrittenOrOriginalSvg, createSvgoConfig(...))`
7. extract `viewBox` from optimized output
8. throw if `viewBox` cannot be determined
9. rewrite root `<svg>` to `<symbol id="..." viewBox="...">`
10. strip root `id`, `viewBox`, `width`, and `height`
11. preserve other root attributes
12. trim final output

## Invariants

- internal id rewrite remains the authoritative sprite namespace layer when enabled
- `removeDimensions` remains mandatory
- symbol root `id` remains `source.name`
- output remains `<symbol>...</symbol>`
- output must contain `viewBox`
- root `fill` and other non-structural attrs are preserved
- local definitions must enter one stable `idMap` before local references are rewritten
- local references must use one consistent mapping rule across element attrs, URL carriers, `<style>`, and SMIL timing targets
- output excludes BOM, XML declaration, and comments
- non-fatal rewrite diagnostics are returned via `BakeResult.issues`
- fatal validation, parse, optimize, and `viewBox` failures throw `BakeError`

## Test-Backed Behaviors

- invalid or missing `name` or `content` throws `BakeError('ValidateSourceInvalid', ...)`
- invalid names throw `BakeError('ValidateNameInvalid', ...)`
- invalid non-`<svg>` roots throw `BakeError('ValidateSvgRootInvalid', ...)`
- rewrite parse failures throw `BakeError('ParseSvgFailed', ...)`
- optimize failures throw `BakeError('OptimizeSvgFailed', ...)`
- missing `viewBox` throws `BakeError('ResolveViewBoxFailed', ...)`
- width and height on the root are removed from final symbol output
- legacy root `id` is replaced by the symbol root id
- root non-structural attrs such as `fill` are preserved
- local definitions and references are rewritten consistently before optimization
- unresolved references can be prefixed or preserved based on `idPolicy.unresolved`
- SMIL timing references remain aligned after rewrite
- style selectors and style URL references are rewritten
- user-supplied `cleanupIds` and `prefixIds` are both filtered out
- `idPolicy.rewrite=false` skips the internal rewrite layer

## Documentation Drift Risks

If source and docs diverge, prefer:

1. `src/baker.ts`
2. `src/options.ts`
3. `src/oven/`
4. tests under `src/__tests__/` and `src/oven/__tests__/`
5. `src/types.ts`
6. `README.md`
