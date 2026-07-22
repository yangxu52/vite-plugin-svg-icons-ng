---
name: vite-plugin-svg-icons-ng-workspace
description: Use for repository-level work in the vite-plugin-svg-icons-ng pnpm workspace: package boundaries, root scripts, docs and playground ownership, release tags, CI, and cross-package validation. Trigger for packages, docs, playground, scripts, CI, or release work; do not use alone for plugin scanning, virtual modules, or HMR internals.
metadata:
  author: yangxu52
  version: '2026.7.22'
---

# vite-plugin-svg-icons-ng Workspace

## Scope

Use this skill only for workspace facts:

- pnpm workspace members, shared tooling, and root scripts
- responsibilities, builds, and release boundaries of the two published packages
- ownership of `docs/`, `playground/`, `scripts/`, and `.github/`
- cross-package changes, validation, and release-tag resolution

Use the package skill alongside this skill for package internals:

- `packages/vite-plugin-svg-icons-ng/`: `vite-plugin-svg-icons-ng`
- `packages/svg-icon-baker/`: `svg-icon-baker`

Do not copy package-level scanning, conversion, or HMR mechanics into this skill.

## Sources of Truth

Inspect the current main branch's `package.json`, `pnpm-workspace.yaml`, target package manifests, build configuration, and test configuration before source and tests. Use `docs/`, CHANGELOG files, and Git history to explain compatibility and evolution, never to override the current implementation.

## Reference Map

Read [Workspace Contract](references/workspace-contract.md) before changing package ownership, exports, root scripts, pnpm configuration, CI, release scripts, tags, docs, or playgrounds. It contains the current workspace map, release contract, and validation selection.

For package-local behavior, use the matching package skill instead of loading unrelated workspace detail.

## Composition and Non-Merge Rule

Keep the three project skills separate. The workspace skill answers where a change belongs and how to validate or release it; the package skills state package-local invariants. Repository history deliberately replaced the broad `project-guide` with these responsibilities. Merging them would load release and documentation detail into package work, and unrelated SVG implementation detail into repository work.

For work that spans the workspace and one package, read this skill first and then the package skill. Composition is not a reason to merge the skill files.

## Should Trigger

- "Which package should own this dependency?"
- "What validation is required after changing both packages?"
- "Which package will this tag publish?"
- "How are docs, playgrounds, and published source separated?"

## Should Not Trigger

- "Fix SVG `url(#id)` rewriting."
- "Change icon scanning and HMR."
- "Change the code emitted by one virtual module."

## Gotchas

- Do not treat a README, playground, or historical branch as the current publication contract.
- Do not move workspace dependencies, patches, or release logic into a demo application.
