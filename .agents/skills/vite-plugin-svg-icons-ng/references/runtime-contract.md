# Runtime Contract

Read this reference before changing `src/plugin/`, virtual modules, HTML injection, SSR loading, runtime sprite mounting, watcher behavior, or HMR.

## Module Ownership

- `src/plugin/build.ts` and `virtual.ts`: virtual module resolution, SSR detection, and module-source rendering.
- `src/plugin/html.ts` and `runtime.ts`: `transformIndexHtml` and runtime sprite mounting code.
- `src/plugin/server.ts`: virtual module invalidation and HMR broadcasts after icon changes.

## Virtual Module and HTML Contract

- Preferred modules: `virtual:svg-icons/register`, `virtual:svg-icons/ids`, and `virtual:svg-icons/sprite`.
- Compatible aliases: `virtual:svg-icons-register` and `virtual:svg-icons-names`. They are deprecated and documented for removal in v2; do not remove them before an explicit breaking change.
- `register` emits client mounting code. Only dev SSR returns an empty `register` module without compiling icons.
- `ids` exports the sorted symbol id array. `sprite` exports the complete sprite string for SSR template injection.
- `htmlMode: 'inline'` inserts the sprite, `'script'` inserts a runtime mounting script, and `'none'` disables automatic injection. Prefer `'none'` with `register` to avoid two managers for the same sprite.
- `inject` applies only to plugin-managed HTML insertion. It does not affect SSR templates that insert `sprite` manually.

## HMR Contract

- The dev server watches every `iconDirs` path and routes `add`, `unlink`, and Vite `handleHotUpdate` through one update path.
- Only case-insensitive `.svg` files inside configured icon directories trigger an update.
- Preserve this order: invalidate compiler and known virtual modules, recompile, then broadcast `svg-icons:update` with the latest `sprite`.
- `handleHotUpdate` returns an empty array for icon changes, preventing the old module chain from applying alongside the custom sprite update.
- Client mounting code reuses runtime state by `customDomId` and synchronizes sprite root attributes and children. Do not regress to first-mount-only behavior.
