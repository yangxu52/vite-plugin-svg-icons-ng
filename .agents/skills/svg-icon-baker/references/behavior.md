# Behavior Reference

This reference describes the current main-branch contract of `packages/svg-icon-baker/`. Read `src/baker.ts`, `src/options.ts`, `src/oven/`, `src/types.ts`, `test/unit/`, and then `README.md`. Use CHANGELOG files to understand breaking changes, never to override current code.

## Package and Module Ownership

- The package is ESM-only, built with `unbuild`, and depends at runtime on `svgo v4`, `css-tree`, `fast-xml-parser`, and `fast-xml-builder`.
- `src/index.ts` exports the public API only.
- `src/types.ts` defines `BakeSource`, `Options`, `BakeResult`, `BakeIssue`, `BakeError`, `Baker`, and related types.
- `src/options.ts` resolves defaults and creates the safely filtered SVGO configuration.
- `src/baker.ts` validates input, removes the SVG preamble, runs SVGO, then delegates symbol construction to `oven/bake.ts`.
- `src/oven/bake.ts` parses optimized XML, conditionally rewrites IDs according to `idPolicy.rewrite`, then rewrites the root.
- `src/oven/collect.ts` collects local definitions, reference carriers, and style parse failures.
- `src/oven/rewrite.ts` builds stable mappings, rewrites definitions and references, and deduplicates issues.
- `src/oven/root.ts` converts root `<svg>` to `<symbol>`, resolves `viewBox`, and removes old root `id`, `width`, and `height`.
- `src/oven/xml.ts` parses, traverses, and builds preserve-order XML.
- Tests live in `test/unit/`, not `src/**/__tests__/`.

## Public API and Error Model

Current `index.ts` exports:

- Functions: `bakeIcon`, `bakeIcons`, `createBaker`
- Value: `BakeError`
- Types: `Baker`, `Options`, `BakeSource`, `BakeResult`, `BakeIssue`, `BakeIssueCode`, `BakeErrorCode`, `IdPolicyOptions`, `SvgoOptions`

All public conversion APIs are synchronous.

```ts
type BakeResult = {
  name: string
  content: string
  issues: BakeIssue[]
}

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

Non-fatal problems are returned in `issues`: unresolved references, duplicate definitions, and unparseable `<style>` content. Fatal errors use `BakeError` codes: `ValidateSourceInvalid`, `ValidateNameInvalid`, `ValidateSvgRootInvalid`, `ParseSvgFailed`, `OptimizeSvgFailed`, and `ResolveViewBoxFailed`.

## Conversion Order

`bakeIcon` creates a baker for one conversion. `bakeIcons` and `createBaker(...).bakeIcons()` reuse resolved options and SVGO configuration within one baker instance.

Keep this order for every source:

1. Validate that source, `name`, and `content` exist. Validate that the name starts with an ASCII letter and contains only letters, numbers, `_`, and `-`.
2. Remove BOM, whitespace, XML declarations, comments, and doctype preamble. Verify that the remaining root starts with `<svg>`.
3. Call `svgo.optimize` with `createSvgoConfig`.
4. Parse optimized XML. If `idPolicy.rewrite` is enabled, collect and rewrite local IDs and references.
5. Rewrite the root to `<symbol>`, set its id to the original `source.name`, and preserve or derive `viewBox`.
6. Build and trim final XML and return accumulated `issues`.

Step 3 before step 4 is the explicit 2.0.0 breaking contract. Custom SVGO plugins observe original IDs, not rewritten IDs.

## SVGO Safety Boundary

`optimize` defaults to `true`. `createSvgoConfig` orders plugins as follows:

1. `preset-default`, with `cleanupIds`, `removeUselessDefs`, `removeHiddenElems`, `removeUnknownsAndDefaults`, `collapseGroups`, `mergePaths`, `convertShapeToPath`, and `removeEmptyContainers` disabled.
2. `removeTitle`, `removeXMLNS`, and `removeXlink`.
3. Allowed plugins from user `svgoOptions.plugins`.

Users cannot add `preset-default`, any of the disabled plugins, `prefixIds`, `reusePaths`, or `convertOneStopGradients`. Filtering prevents the optimizer from deleting, merging, or renaming local IDs before the internal mapping runs.

`options.ts` does not explicitly register `removeDimensions`. Root `width` and `height` removal and the `viewBox` guarantee are output rules in `oven/root.ts`; do not describe that plugin as current implementation.

## ID Rewrite and Root Rules

When rewriting is enabled:

1. Collect `id` and `xml:id` definitions in document order and create one stable mapping per original ID. For duplicate definitions, keep the first, remove later definitions, and report a duplicate-definition issue.
2. Generate namespaced mappings using `named`, `minified`, or `hashed` style, the symbol name, and `delim`.
3. Apply the same mapping to `href`, `xlink:href`, supported `url(#...)` attributes, SMIL `begin` and `end`, `aria-labelledby`, `aria-describedby`, and ID selectors and URL references in `<style>`.
4. For unresolved references, `prefix` creates and reuses a mapping with the same strategy; `preserve` keeps the original value. Both report `ResolveReferenceFailed`.

After rewriting, `rewriteRoot` must:

- accept root `<svg>` only, otherwise fail;
- keep a valid `viewBox`, or derive one from numeric or `px` root `width` and `height`, otherwise fail;
- rename the root to `symbol`, set `id = source.name`, and set `viewBox`;
- remove old root `id`, `width`, and `height` while preserving other root attributes.

## Regression Focus

- Optimization must precede ID rewriting.
- `idPolicy.rewrite: false` must skip internal mapping but still rewrite the root.
- `BakeIssue` is not swallowed-error behavior. Consumers receive a successful result and must be able to observe diagnostics.
- Repeated calls to one `createBaker` instance reuse options and SVGO configuration while preserving a separate namespace per icon.
- For reference-carrier changes, cover defined and undefined targets, duplicate definitions, style parse failures, SMIL offsets, and ARIA token lists.
- For public API or output-markup changes, update `test/unit/` and `README.md`. `vite-plugin-svg-icons-ng` is also a package consumer.
