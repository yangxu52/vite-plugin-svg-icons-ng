---
name: vite-plugin-svg-icons-ng-workspace
description: Workspace skill for the vite-plugin-svg-icons-ng monorepo. Use when you need repository-level facts such as monorepo structure, package ownership, docs or playground boundaries, release scripts, workspace commands, or cross-package validation before changing code, tests, docs, or release flow.
metadata:
  author: yangxu52
  version: '2026.4.25'
---

# vite-plugin-svg-icons-ng-workspace

## Scope

Use this skill for workspace-level questions only:

- monorepo structure and package boundaries
- which package owns which responsibility
- `docs`, `playground`, `scripts`, `patches` responsibilities
- root scripts, workspace commands, release flow, and validation entrypoints

Do not use this skill for plugin internals such as scan flow, cache behavior, virtual modules, or HMR details.
Use `vite-plugin-svg-icons-ng` for plugin implementation facts.

## Workspace Layout

- `packages/vite-plugin-svg-icons-ng/`: published Vite plugin package.
- `packages/svg-icon-baker/`: internal SVG-to-symbol conversion package used by the plugin.
- `docs/`: VitePress documentation site.
- `playground/`: runnable integration examples and behavior checks.
- `scripts/`: release and maintenance scripts.
- `patches/`: patched upstream dependency files.

## Ownership Boundaries

- Root `package.json`: workspace commands, shared tooling, and release entrypoints.
- `pnpm-workspace.yaml`: workspace membership, dependency patching, and overrides.
- `packages/vite-plugin-svg-icons-ng`: Vite-facing runtime integration.
- `packages/svg-icon-baker`: SVG transformation and symbol conversion logic.
- `docs`: user-facing documentation, not runtime source of truth.
- `playground`: integration verification targets, not package source of truth.

## Workspace Conventions

- Package builds and tests run through pnpm workspace filters.
- Cross-package edits should preserve the boundary: plugin orchestrates, baker converts.
- If behavior and docs diverge, prefer package source and tests over `docs/`.
- Root validation should cover both package-level correctness and workspace-level regressions.

## Validation

- `pnpm build`
- `pnpm test`
- `pnpm tsc`
- `pnpm build:docs`
- `pnpm build:playground`

## Gotchas

- Do not move plugin internals into this skill; keep implementation detail in the plugin skill.
- Do not treat `playground` or `docs` as the source of truth for package contracts.
- Do not blur package boundaries when changing both `vite-plugin-svg-icons-ng` and `svg-icon-baker`.
