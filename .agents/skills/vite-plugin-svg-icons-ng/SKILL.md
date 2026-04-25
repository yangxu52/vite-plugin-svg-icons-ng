---
name: vite-plugin-svg-icons-ng
description: Plugin-domain skill for vite-plugin-svg-icons-ng internals. Use when changing or reasoning about icon scanning, compile and cache flow, Vite virtual modules, sprite injection, or HMR behavior inside packages/vite-plugin-svg-icons-ng.
metadata:
  author: yangxu52
  version: '2026.4.25'
---

# vite-plugin-svg-icons-ng

## Scope

Use this skill for plugin internals only:

- SVG directory scanning
- compile flow and cache invalidation
- Vite virtual module ids and rendered module content
- sprite injection behavior
- dev-server watch behavior and HMR updates

Do not use this skill for monorepo layout, docs ownership, playground structure, or release scripts.
Use `vite-plugin-svg-icons-ng-workspace` for repository-level questions.

## Source Of Truth

1. `packages/vite-plugin-svg-icons-ng/src/index.ts`
2. `packages/vite-plugin-svg-icons-ng/src/plugin/*`
3. `packages/vite-plugin-svg-icons-ng/src/core/*`
4. `packages/vite-plugin-svg-icons-ng/src/cache/*`
5. `packages/vite-plugin-svg-icons-ng/src/types.ts`
6. `packages/vite-plugin-svg-icons-ng/src/__tests__/` and `src/plugin/__tests__/`

## Package Layout

Inside `packages/vite-plugin-svg-icons-ng/src`:

- `index.ts`: plugin entry, hook wiring, and context creation.
- `core/scanner.ts`: scan `iconDirs` and produce normalized icon file records.
- `core/compiler.ts`: compile orchestration, in-flight dedupe, cache lookup, invalidation, and duplicate symbol handling.
- `cache/memoryCache.ts`: default in-memory cache keyed by file path plus content hash.
- `plugin/virtual.ts`: virtual id resolution and module rendering for `register`, `ids`, and `sprite`.
- `plugin/server.ts`: watcher registration, module invalidation, and HMR broadcast.

## Scan And Cache Model

- `scanIconDirs` uses `tinyglobby` to collect `**/*.svg` under every configured icon directory.
- Scan results normalize path separators and keep `file`, `iconDir`, and `relativePath`.
- Compiler caches transformed icons by `file + hash`.
- `getResult` reuses the last compile result until marked dirty.
- `inFlight` prevents duplicate concurrent recompilation.
- `invalidate(file)` marks the compiler dirty and invalidates that file in cache when provided.

## Virtual Modules

- Preferred ids:
  - `virtual:svg-icons/register`
  - `virtual:svg-icons/ids`
- Compatible legacy ids:
  - `virtual:svg-icons-register`
  - `virtual:svg-icons-names`
- Additional module:
  - `virtual:svg-icons/sprite`

Module behavior:

- `register`: emits client code that mounts or replaces the sprite DOM.
- `ids`: exports the compiled symbol id array.
- `sprite`: exports the sprite markup string.
- Dev SSR returns an empty object for `register`.

## HMR Model

- Dev server adds every `iconDirs` path to the watcher.
- `add`, `unlink`, and `handleHotUpdate` all route through the same icon-change path.
- On icon change, the plugin invalidates compiler state and known virtual modules.
- The server sends a custom HMR event with updated `sprite`.
- Client `register` code replaces the existing mounted sprite in place on update.

## Compatibility Contract

- Keep dev/build using the same compiler result model.
- Keep virtual id compatibility for both preferred and legacy ids.
- Keep plugin/context/core/cache responsibilities separated.
- Keep shared contracts centralized in `src/types.ts`.

## Validation

- `pnpm --filter vite-plugin-svg-icons-ng run test`
- `pnpm --filter vite-plugin-svg-icons-ng run build`
- `pnpm tsc`

## Gotchas

- Do not document monorepo structure here; keep this skill package-focused.
- Do not change virtual module ids lightly; they are part of the compatibility surface.
- Do not bypass compiler invalidation when touching watch or HMR behavior.
