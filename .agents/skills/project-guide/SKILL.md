---
name: project-guide
description: Repository guide for vite-plugin-svg-icons-ng covering architecture, dependencies, runtime model, compatibility constraints, and validation commands.
metadata:
  author: yangxu52
  version: '2026.3.21'
---

# project-guide

## Project Overview

`vite-plugin-svg-icons-ng` is a Vite plugin that scans SVG directories, builds an SVG sprite, and provides virtual modules for sprite injection and symbol id export.

## Repository Layout

- `packages/vite-plugin-svg-icons-ng/`: plugin source and package build output.
- `docs/`: VitePress documentation site.
- `playground/basic/`: runnable demo project for behavior checks.
- `scripts/`: release and maintenance scripts.
- `patches/`: dependency patch files.

## Core Package Layout

packages/vite-plugin-svg-icons-ng:

- `src/index.ts`: plugin entry and lifecycle wiring.
- `src/plugin/*`: Vite integration and virtual module dispatch.
- `src/core/*`: scan/transform/compile pipeline.
- `src/cache/*`: cache abstraction and default memory implementation.
- `src/types.ts`: shared type contracts.
- `src/constants.ts`: virtual ids, templates, and validation constants.

## Core Dependencies

- `vite` (peer): plugin runtime integration.
- `fast-glob`: SVG file scanning.
- `fs-extra`: file reading utilities.
- `svg-icon-baker`: SVG to symbol transformation (SVGO-backed).

## Runtime Model

1. Validate and resolve options.
2. Resolve virtual module ids (`register` and `ids`, including legacy ids).
3. Compile flow: scan SVG files -> cache check by `path + mtimeMs` -> transform -> collect `symbols` and `ids`.
4. Render virtual modules:
   - `register`: sprite DOM injection script
   - `ids`: exported symbol id array

Dev serves virtual module content through middleware URL interception; build serves through `load`.

## Compatibility Contract

- Keep dev/build on the same compile result model (`compileIcons`).
- Keep `plugin/*` and `core/*` separation.
- Keep the shared top-level types uniformly defined in `src/types.ts`.
- Keep virtual module compatibility:
  - preferred: `virtual:svg-icons/register`, `virtual:svg-icons/ids`
  - compatible: `virtual:svg-icons-register`, `virtual:svg-icons-names`
- Avoid reintroducing broad aggregator exports.

## Validation

- `pnpm test-unit`
- `pnpm --filter vite-plugin-svg-icons-ng run build`
- `pnpm tsc`
