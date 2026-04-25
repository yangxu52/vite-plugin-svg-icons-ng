---
name: svg-icon-baker
description: A domain skill for understanding and working with svg-icon-baker, including architecture, conventions, and internal logic. Use when working in this repository and you need exact project facts, package boundaries, public API constraints, conversion invariants, validation commands, or documentation drift before editing code, tests, packaging, or docs.
---

# SVG Icon Baker

## Architecture

- Repository layout: pnpm workspace monorepo.
- Published package: `packages/svg-icon-baker`.
- Module format: ESM only.
- Build tool: `unbuild`.
- Runtime dependency: `svgo ^4.0.1`.
- Engine constraints: Node `^20 || ^22 || >=24`, pnpm `>=10`.
- Source layout:
  - `src/index.ts`: public exports.
  - `src/types.ts`: public and internal types.
  - `src/baker.ts`: validation, option normalization, plugin composition, and SVG-to-symbol conversion.
  - `src/__tests__/baker.test.ts`: conversion, validation, and option behavior.
  - `src/__tests__/svgo.test.ts`: SMIL timing prefix behavior.

## Conventions

- Source of truth order:
  1. `packages/svg-icon-baker/src/baker.ts`
  2. `packages/svg-icon-baker/src/__tests__/`
  3. `packages/svg-icon-baker/src/types.ts`
  4. `packages/svg-icon-baker/package.json` and `packages/svg-icon-baker/build.config.ts`
  5. `packages/svg-icon-baker/README.md`
- Public API is synchronous.
- Current result shape is `BakeResult = { name: string; content: string }`.
- `Options` is `boolean | ManualOptions`.
- `content` is the output contract consumed by downstream sprite tooling.
- When API shape or semantics change, update source, tests, and README together.

## Internal Logic

- `inferOptions`: normalize `Options` into a complete option object.
- `createSvgoPlugins`: build optional SVGO plugins and always append `removeDimensions`.
- `convertToSymbol`: validate input, append mandatory `prefixIds`, run SVGO, require `viewBox`, remove XML declaration, then delegate root-tag rewrite to
  `toSymbolRootTag`.
- `toSymbolRootTag`: strip root `id/viewBox/width/height`, preserve other root attrs, and rewrite `<svg>...</svg>` to `<symbol id=... viewBox=...>...</symbol>`.
- `bakeIcons` infers options once per call and applies per-source `prefixIds` using each `source.name`.

Read `references/behavior.md` before changing conversion steps, output markup, option semantics, or packaging behavior.

## Validation

```bash
pnpm test
pnpm build
pnpm tsc
pnpm --filter svg-icon-baker run test
pnpm --filter svg-icon-baker run build
```
