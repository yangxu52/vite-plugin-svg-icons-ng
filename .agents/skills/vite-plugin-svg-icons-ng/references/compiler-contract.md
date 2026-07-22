# Compiler Contract

Read this reference before changing `src/core/`, `src/cache/`, option resolution, symbol ids, error policy, compile ordering, or baker issue reporting.

## Module Ownership

- `src/index.ts`: creates the Vite plugin, initializes context in `configResolved`, and wires Vite hooks.
- `src/types.ts`: shared option, compile-result, cache, and context contracts.
- `src/constants.ts`: validation constants and values shared by compiler and runtime code.
- `src/core/scanner.ts`: uses `tinyglobby` to scan `**/*.svg` under each `iconDirs`, preserving configured directory order and sorting each directory by relative path.
- `src/core/transformer.ts`: reads source, generates and validates `symbolId` from `[dir]` and `[name]`, invokes the baker instance, and overrides existing `stroke` attributes.
- `src/core/compiler.ts`: deduplicates compilation, caches by file path and content SHA-1 ETag, reports errors and `BakeIssue`s, resolves conflicts, and invalidates state.
- `src/core/builder.ts`: sorts by final symbol id and produces `ids`, `symbols`, and one sprite.
- `src/cache/memoryCache.ts`: default in-memory cache.

## Compilation and Error Contract

1. After `configResolved`, resolve relative `iconDirs` from Vite `root`; preserve absolute paths.
2. Scan files, read content, reuse or update cache entries, then call `svg-icon-baker`.
3. Sort by symbol id so `ids`, `symbols`, and sprite order stay deterministic.
4. Reuse the last result until invalidated and allow only one in-flight recompilation.
5. Broken SVGs, invalid per-file symbol ids, and duplicate ids warn and skip by default; `failOnError: true` throws and stops compilation.
6. Report non-fatal baker `issues` through the Vite logger; never discard them silently.
