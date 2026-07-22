---
name: svg-icon-baker
description: Use for packages/svg-icon-baker SVG-to-symbol work: public API, synchronous error model, safe SVGO configuration, local ID and reference rewriting, viewBox handling, and output invariants. Trigger for baker, options, oven, package tests, or README changes; do not use for Vite scanning, virtual modules, HMR, workspace, or release work.
metadata:
  author: yangxu52
  version: '2026.7.22'
---

# svg-icon-baker

## Scope

Use this skill only for `packages/svg-icon-baker/`:

- public API, types, synchronous exceptions, and diagnostic contracts
- SVG-to-`<symbol>` conversion order and root-element rules
- SVGO configuration, safe plugin filtering, and ID rewrite policy
- definition, reference, and style-carrier rewriting in `oven/`
- package tests and README consistency

Use `vite-plugin-svg-icons-ng` for the Vite caller's scanning, cache, virtual modules, and HMR. Use `vite-plugin-svg-icons-ng-workspace` for workspace, release, or cross-package work.

## Workflow

Inspect `src/baker.ts`, `src/options.ts`, `src/types.ts`, and the target `oven/` module, then confirm boundaries in `test/unit/`. Read [Behavior Reference](references/behavior.md) before changing any of these:

- conversion order, SVGO plugin filtering, or `idPolicy`
- `id`, `href`, `url(#...)`, SMIL, ARIA, or `<style>` reference rewriting
- `BakeError`, `BakeIssue`, public exports, or output markup
- `viewBox`, root attributes, or dimension handling

README and CHANGELOG files describe consumer expectations and evolution. When they diverge from source or tests, source and tests win.

## Invariants

- Keep the public API synchronous. Current exports include `bakeIcon`, `bakeIcons`, `createBaker`, `BakeError`, and the public types in `src/types.ts`.
- `BakeResult` must retain `name`, `content`, and non-fatal diagnostic `issues`. Fatal validation, optimization, parsing, and viewBox failures must be `BakeError`s.
- Successful output must be `<symbol>...</symbol>` with root `id === source.name` and a `viewBox`; old root `id`, `width`, and `height` must not remain.
- Optimization precedes internal ID rewriting. Do not restore the old rewrite-then-optimize order or make SVGO `prefixIds` or `cleanupIds` the naming authority.
- When rewriting is enabled, build one stable map for local definitions before rewriting references. Unresolved references must follow `idPolicy.unresolved` and report an issue.
- `idPolicy.rewrite: false` must skip the internal rewrite layer.

## Validation

- Unit tests: `pnpm --filter svg-icon-baker run test`
- Typecheck: `pnpm --filter svg-icon-baker run typecheck`
- Package build: `pnpm --filter svg-icon-baker run build`
- Publication entry changes: `npm pack --dry-run --json`

## Should Trigger

- "Why do optimized SVG references not share one namespace?"
- "Change `idPolicy`, `BakeIssue`, or `BakeError`."
- "Why is my custom SVGO plugin filtered?"
- "Fix local IDs in SMIL, ARIA, or style content."

## Should Not Trigger

- "Why does adding an icon not hot-update the browser?"
- "Change the SSR output of `virtual:svg-icons/sprite`."
- "Change the pnpm workspace or release tag."

## Gotchas

- Do not use README prose as the sole conversion source of truth. Dimension stripping is guaranteed by root rewriting, not by an explicit `removeDimensions` plugin in current `options.ts`.
- Do not omit `createBaker` or make the synchronous API asynchronous.
- Do not preserve or rewrite unresolved local references silently; emit a `BakeIssue`.
- Do not decide whether a local definition enters the ID map based on whether it is referenced.
