---
name: svg-icon-baker
description: Package-domain skill for svg-icon-baker internals. Use when changing or reasoning about packages/svg-icon-baker public API, SVG-to-symbol conversion, SVGO v4 plugin ordering, prefixIds or cleanupIds behavior, conversion invariants, or package-specific tests and docs.
metadata:
  author: yangxu52
  version: '2026.4.27'
---

# svg-icon-baker

## Scope

Use this skill for `packages/svg-icon-baker` only:

- public API and type contracts
- SVG-to-symbol conversion flow
- SVGO v4 config composition
- internal sprite id rewrite, and `prefixIds` / `cleanupIds` replacement boundaries
- package tests and README consistency

Do not use this skill for Vite plugin scan flow, cache behavior, virtual modules, sprite injection, or HMR details.
Use `vite-plugin-svg-icons-ng` for plugin internals and `vite-plugin-svg-icons-ng-workspace` for repository-level questions.

## Source Of Truth

1. `packages/svg-icon-baker/src/baker.ts`
2. `packages/svg-icon-baker/src/options.ts`
3. `packages/svg-icon-baker/src/types.ts`
4. `packages/svg-icon-baker/src/oven/`
5. `packages/svg-icon-baker/src/__tests__/`
6. `packages/svg-icon-baker/package.json` and `packages/svg-icon-baker/build.config.ts`
7. `packages/svg-icon-baker/README.md`

## Package Layout

Inside `packages/svg-icon-baker/src`:

- `index.ts`: public exports only.
- `types.ts`: public option and result contracts.
- `options.ts`: option normalization and SVGO plugin list construction.
- `baker.ts`: input validation, internal id rewrite, `svgo.optimize`, `viewBox` enforcement, and `<svg>` to `<symbol>` rewrite.
- `oven/parse.ts`: XML parse/build helpers used by the rewrite core.
- `oven/collect.ts`: local definitions and references collection.
- `oven/rewrite.ts`: `definedIds -> idMap -> referenceIds` rewrite entry.
- `oven/types.ts`: internal rewrite data structures and contracts.
- `__tests__/baker.test.ts`: output structure, validation, attribute preservation, and prefix behavior.
- `__tests__/options.test.ts`: option semantics and plugin ordering.
- `__tests__/svgo.test.ts`: SVGO composition and blocklist behavior.
- `oven/__tests__/collect.test.ts`: collected definition/reference coverage.
- `oven/__tests__/rewrite.test.ts`: sprite id policy and issue reporting behavior.

## Public Contract

- Public API is synchronous.
- Current exports are `bakeIcon`, `bakeIcons`, `BakeError`, and types from `src/types.ts`.
- Current result shape is:

```ts
type BakeResult = {
  name: string
  content: string
  issues: BakeIssue[]
}
```

- `Options` is an object with:
  - `optimize?: boolean`
  - `svgoOptions?: Pick<Config, 'multipass' | 'floatPrecision' | 'js2svg' | 'plugins'>`
  - `idPolicy?: { rewrite?: boolean; unresolved?: 'prefix' | 'preserve'; idStyle?: 'named' | 'minified' | 'hashed'; delim?: '-' | '_' }`
- Non-fatal rewrite diagnostics are returned through `BakeResult.issues`.
- Fatal validation, parse, optimize, and viewBox failures throw `BakeError`.

## Conversion Model

`bakeIcon` and `bakeIcons` both normalize options first, then convert each source through the same pipeline:

1. validate `source.name` and `source.content`
2. validate the root still starts with `<svg>`
3. if `idPolicy.rewrite` is enabled, run internal sprite id rewrite first
4. build SVGO config in `options.ts`
5. run `svgo.optimize`
6. require a root `viewBox` after optimization
7. strip XML declaration, BOM, comments, and doctype preamble
8. rewrite root `<svg>` and `</svg>` to `<symbol>` and `</symbol>`
9. preserve non-structural root attributes
10. keep symbol root `id` equal to `source.name`

The internal rewrite model must stay:

1. collect `definedIds`
2. build stable `idMap`
3. rewrite all `referenceIds` against the same map
4. optionally let later cleanup optimize structure, never decide naming first

## Rewrite And SVGO Rules

- Internal rewrite is the authoritative sprite id namespace layer.
- `removeDimensions` is mandatory so `viewBox` remains the sizing contract.
- User-supplied `prefixIds` and `cleanupIds` must be filtered out so the package keeps one authoritative rewrite strategy.
- Default safe optimization uses `preset-default`, but `cleanupIds` is explicitly disabled there.
- Internal rewrite owns sprite naming semantics. SVGO only does later structural cleanup and safe normalization.
- Do not reintroduce a final external `prefixIds` pass as the naming authority.
- Do not let a cleanup phase decide whether a local definition enters the namespace map.
- Unresolved local references are policy-controlled:
  - `prefix`: rewrite using the configured `idStyle`
  - `preserve`: keep the original token
- Unresolved handling may report issues, but the kernel should not hardcode plugin-layer failure policy.

## Invariants

- Keep output wrapped in `<symbol>...</symbol>`.
- Keep symbol root `id === source.name`.
- Keep `viewBox` mandatory in output.
- Keep local definitions entering one stable namespace map before reference rewriting.
- Keep local references rewritten by one consistent rule set across attributes, URL carriers, style content, and SMIL timing targets.
- Keep `href`, `url(#...)`, and SMIL `begin/end` references aligned with rewritten ids.
- Keep root `id/viewBox/width/height` stripped before writing the new symbol root.
- Keep other root attributes such as `fill` when present.
- Keep BOM, XML declaration, and comments out of final output.
- Keep issue reporting in-band through `BakeResult.issues`; keep fatal failures in `BakeError`.

## Validation

- `pnpm --filter svg-icon-baker run test`
- `pnpm --filter svg-icon-baker run build`
- `pnpm tsc`

## Gotchas

- Do not trust `README.md` over source and tests.
- Do not restore sprite semantics to external `prefixIds` / `cleanupIds` ordering.
- Do not let “is referenced” decide whether a local `id` is namespace-managed.
- Do not silently guess unresolved targets without surfacing an issue.
- Do not break sync behavior, `BakeResult.issues`, or `BakeError` without updating downstream consumers.
