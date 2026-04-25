# Behavior Reference

## Architecture

- Repository layout: pnpm workspace monorepo.
- Published package: `packages/svg-icon-baker`.
- Build tool: `unbuild`.
- Module format: ESM only.
- Declarations: enabled.
- CommonJS emission: disabled.
- Runtime dependency: `svgo ^4.0.1`.
- Engine constraints: Node `^20 || ^22 || >=24`, pnpm `>=10`.

### Code structure

- `src/index.ts`: public export surface.
- `src/types.ts`: public and internal type definitions.
- `src/baker.ts`: main implementation.
- `src/__tests__/baker.test.ts`: conversion, validation, and option semantics.
- `src/__tests__/svgo.test.ts`: SMIL timing prefix behavior.

### Ownership boundaries

- `index.ts` owns exports only.
- `types.ts` owns API shapes.
- `baker.ts` owns orchestration, validation, plugin composition, and symbol rewriting.

## Conventions

- Public API is synchronous.
- Current result shape:

```ts
type BakeResult = {
  name: string
  content: string
}
```

- `Options` remains `boolean | ManualOptions`.
- `content` is the output contract consumed by downstream sprite tooling.
- `README.md` is consumer documentation, not the source of truth.
- When docs and code conflict, prefer `baker.ts`, tests, and `types.ts`.
- When API shape or semantics change, update source, tests, and README together.
- Avoid breaking changes to output markup, error text, or sync behavior unless explicitly requested.

## Internal Logic

### Public API

Current exports from `packages/svg-icon-baker/src/index.ts`:

- `bakeIcon`
- `bakeIcons`
- `Options`
- `BakeSource`
- `BakeResult`

### Processing model

`baker.ts` is organized around three responsibilities:

1. `inferOptions`: normalize `Options` into a fully populated option object.
2. `createSvgoPlugins`: build the optional SVGO plugin list and always append `removeDimensions`.
3. `convertToSymbol`: validate source input, append mandatory `prefixIds`, run SVGO, require `viewBox`, remove XML declaration, and delegate root-tag rewrite to
   `toSymbolRootTag`.

### Batch behavior

- `bakeIcons` infers options once per call.
- `bakeIcons` reuses the same inferred option set for all sources in that call.
- Each source still gets its own `prefixIds` prefix derived from `source.name`.

### Conversion pipeline

1. Infer options with `inferOptions`.
2. Build plugins with `createSvgoPlugins`.
3. Add optional SVGO plugins from `ManualOptions`.
4. Always append `removeDimensions`.
5. Validate `source`, `source.name`, and `source.content`.
6. Validate `source.name` with `^[A-Za-z][A-Za-z0-9_-]*$`.
7. Append mandatory `prefixIds` with prefix `${source.name}-` and empty delimiter.
8. Run `optimize` from `svgo`.
9. Read `viewBox` from optimized output.
10. Throw if `viewBox` cannot be determined.
11. Remove any XML declaration.
12. In `toSymbolRootTag`, strip root `id/viewBox/width/height` from the opening `<svg ...>` tag.
13. Rewrite opening/closing tags to `<symbol id="${source.name}" viewBox="${viewBox}" ...>` and `</symbol>`, preserving other root attributes.
14. Trim the result.

## Invariants

- Keep `prefixIds` mandatory.
- Keep `removeDimensions` mandatory.
- Keep the symbol `id` equal to `source.name`.
- Keep output wrapped in `<symbol>...</symbol>`.
- Keep `viewBox` mandatory in output.
- Keep non-structural root attributes (for example `fill`) when converting root tags.
- Replace any root `id` with `source.name` on the symbol root.
- Keep ID, URL, and SMIL timing references prefixed.
- Keep `xlink:href` normalized to `href` in output.
- Keep BOMs, XML declarations, and comments out of output.
- Keep downstream usage model: higher-level bundler plugins inject emitted symbol content into HTML.

## Option Semantics

`Options` is `boolean | ManualOptions`.

### Boolean form

- `true`: use default options.
- `false`: disable optional optimizations only. Mandatory conversion still runs.

### Default object values

- `defaultPreset: true`
- `convertOneStopGradients: false`
- `convertStyleToAttrs: false`
- `reusePaths: false`
- `removeScripts: false`
- `removeTitle: true`
- `removeXMLNS: true`
- `removeXlink: true`

## Test-Backed Behaviors

- Invalid or missing `name` or `content` throws.
- Invalid names throw.
- Non-SVG input can surface `Parsing failed.`
- Missing root `viewBox` after optimization throws `Cannot determine viewBox.`
- Width and height on the root are removed.
- Root non-structural attributes such as `fill` are preserved.
- A legacy root `id` is replaced by the symbol root `id` (`source.name`).
- Root dimensions can produce `viewBox="0 0 32 16"`.
- Prefixed URL references remain valid.
- SMIL timing expressions such as `a.end`, `b.end-0.5s`, and semicolon-separated lists are prefixed correctly.

## Documentation Drift

- `bakeIcon` was documented as async, but it is synchronous.
- `BakeResult.symbol` was documented, but actual output uses `BakeResult.content`.
