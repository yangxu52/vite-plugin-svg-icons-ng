# Workspace Contract

Read this reference for package boundaries, root commands, CI, release tags, documentation, playgrounds, or pnpm configuration. Confirm current files before relying on these facts.

## Workspace Map and Ownership

- `packages/vite-plugin-svg-icons-ng/`: published Vite plugin; `svg-icon-baker` is a workspace dependency.
- `packages/svg-icon-baker/`: independently published ESM SVG-to-symbol conversion package.
- `docs/`: VitePress consumer documentation. Its config reads the plugin package version, but documentation is not the sole runtime contract.
- `playground/`: Vue, SSR, and gallery integration targets; it does not own published package source.
- `scripts/release-contract.mjs`, `scripts/release.config.mjs`, and `scripts/resolve-release.mjs`: resolve the package and version from a Git tag.
- `.github/workflows/test.yml`: CI unit, playground, and browser validation. `.github/workflows/release.yml`: tag-driven build and publication of one package.
- `patches/`: pnpm-managed dependency patches. Keep `pnpm-workspace.yaml` `patchedDependencies` authoritative.

## Build and Release Contract

- The plugin package uses `unbuild` for ESM and CommonJS entries. The baker package uses `unbuild` for ESM. Before changing exports, inspect each manifest and the real `dist/` output.
- `v<version>` identifies `vite-plugin-svg-icons-ng` only.
- `<package-dir>@<version>` identifies a directory-scoped release; `svg-icon-baker@<version>` currently uses it.
- The release workflow verifies the tag version against `packages/<dir>/package.json`, then builds and publishes only that package.
- For package-boundary or export changes, run `npm pack --dry-run --json` from the package directory to verify the tarball contains every entry point.

## Validation Selection

Choose the smallest sufficient validation set:

- Workspace type contract: `pnpm run typecheck`
- Both package unit suites: `pnpm run test`
- Plugin browser behavior: `pnpm run test:browser`; Playwright Chromium is required
- All package tests: `pnpm run test:all`
- Both published packages: `pnpm run build`
- Playground integration: `pnpm run build:playground`
- Documentation: `pnpm run build:docs`

For a single-package change, run that package's own `typecheck`, `test`, and `build` scripts first. Escalate to workspace commands only for cross-package or publication boundaries.
