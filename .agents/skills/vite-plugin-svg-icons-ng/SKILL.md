---
name: vite-plugin-svg-icons-ng
description: Use for packages/vite-plugin-svg-icons-ng implementation work: icon scanning, compilation and caching, symbolId generation, HTML injection, Vite virtual modules, SSR, and HMR. Trigger for changes under src/core, src/plugin, src/cache, src/types, or their tests; use the other skills for workspace release boundaries or svg-icon-baker conversion internals.
metadata:
  author: yangxu52
  version: '2026.7.22'
---

# vite-plugin-svg-icons-ng

## Scope

Use this skill only for the Vite integration and icon compilation behavior in `packages/vite-plugin-svg-icons-ng/`:

- `iconDirs` scanning, `symbolId` generation, compilation cache, and error policy
- HTML injection, runtime mounting, and virtual module rendering
- dev-server watching, module invalidation, and sprite HMR
- package types, unit tests, and browser tests

Use `svg-icon-baker` for SVG conversion and ID rewriting. Use `vite-plugin-svg-icons-ng-workspace` for workspace, release, or cross-package work.

## Sources of Truth

Confirm behavior in this order:

1. `src/index.ts`, `src/types.ts`, and `src/constants.ts`
2. `src/core/`, `src/cache/`, and `src/plugin/`
3. `test/unit/` and `test/browser/`
4. The package `package.json`, `vitest.config.ts`, and `README.md`
5. `docs/`, CHANGELOG files, and Git history

Documentation describes the consumer contract; source and tests define execution semantics. Historical `src/**/__tests__` locations moved to `test/unit/`; do not reintroduce the old paths.

## Reference Map

- Read [Compiler Contract](references/compiler-contract.md) before changing `src/core/`, `src/cache/`, option resolution, symbol ids, error policy, compile ordering, or `BakeIssue` reporting.
- Read [Runtime Contract](references/runtime-contract.md) before changing `src/plugin/`, virtual modules, `htmlMode`, SSR loading, sprite mounting, watcher behavior, or HMR.

## Immediate Invariants

- Dev, build, and SSR must use the same `IconCompiler.getResult()` result model.
- Keep preferred virtual ids and both deprecated aliases until an explicit breaking change.
- An icon change must invalidate compiler state and virtual modules, recompile, then broadcast the latest sprite.

## Validation

- Types and implementation: `pnpm --filter vite-plugin-svg-icons-ng run typecheck`
- Unit tests: `pnpm --filter vite-plugin-svg-icons-ng run test:unit`
- Browser mounting, HMR, and SSR behavior: `pnpm --filter vite-plugin-svg-icons-ng run test:browser`
- Package build: `pnpm --filter vite-plugin-svg-icons-ng run build`
- Integration boundaries: `pnpm run build:playground`

## Should Trigger

- "Why do ids not refresh after adding an SVG?"
- "Change HTML injection or SSR behavior for `htmlMode`."
- "Add a compatible virtual module alias."
- "Fix icon caching or HMR on Windows paths."

## Should Not Trigger

- "Change the SVGO safe plugin list."
- "Change `url(#id)`, SMIL, or `<style>` ID rewriting."
- "Confirm workspace commands or release tags."

## Gotchas

- Do not change virtual module ids or deprecated aliases without updating types, documentation, and compatibility tests.
- Do not use automatic `htmlMode` injection and manual `register` mounting as the default for the same sprite.
