# Migration from the Old Plugin

This page explains how to migrate from the old `vite-plugin-svg-icons` plugin to `vite-plugin-svg-icons-ng`.

## Overview

In most projects, migration is just a plugin replacement:

::: code-group

```sh [pnpm]
pnpm remove vite-plugin-svg-icons && pnpm add -D vite-plugin-svg-icons-ng
```

```sh [npm]
npm remove vite-plugin-svg-icons && npm i -D vite-plugin-svg-icons-ng
```

```sh [yarn]
yarn remove vite-plugin-svg-icons && yarn add -D vite-plugin-svg-icons-ng
```

:::

> In most projects (`Vite >= 5` and no `svgoOptions` config), your existing **configuration** and **usage pattern** continue to work without any changes.

This means:

- You do **not** need to change your icon directory structure.
- You do **not** need to change your `symbolId` rule.
- You do **not** need to change how your app references icons.

---

Only two areas are worth checking during migration:

- [Deprecated legacy virtual module ids](#deprecated-legacy-virtual-module-ids) (planned for removal in v2)
- [Advanced `svgoOptions` config](#migrating-svgooptions) (only relevant if you actually used it before)

If your project is still on Vite 2 / 3 / 4, follow the Vite migration guide first and upgrade to Vite 5 / 6.

## Vite Support

`vite-plugin-svg-icons-ng` no longer supports Vite 2 / 3 / 4. It now requires `Vite >= 5`.

- Vite 5 no longer supports Node.js 14 / 16 / 17 / 19, which are already EOL. You now need Node.js 18 / 20 / 22+.
- Vite 5 deprecated the CJS Node API. It is recommended to declare `"type": "module"` explicitly in `package.json`. By default, `.js` files are then treated as ESM. If you still need CJS, rename the file to `.cjs`.

> See: [Vite: Migration from v4](https://v5.vite.dev/guide/migration)

## Deprecated Legacy Virtual Module Ids

The old virtual module ids are still supported for compatibility, but they are deprecated because they do not follow the namespaced virtual module convention. They are planned for removal in `v2.0.0`.

Update them as early as possible:

- `virtual:svg-icons-register` -> `virtual:svg-icons/register`
- `virtual:svg-icons-names` -> `virtual:svg-icons/ids`

Example:

```ts
// old
import 'virtual:svg-icons-register'
import ids from 'virtual:svg-icons-names'
```

```ts
// new
import 'virtual:svg-icons/register'
import ids from 'virtual:svg-icons/ids'
```

If you are still using the old ids, nothing breaks immediately in the current release. But you should replace them before upgrading to `v2.0.0`.

> [!TIP]
> Since `v1.7.0`, the SVG sprite is injected into `index.html` by default, so you can get the sprite even without importing a virtual module.

## Migrating `svgoOptions`

`svgoOptions` is an advanced option mainly used to customize `SVGO` behavior.

If you never configured `svgoOptions` explicitly, you can ignore this section. There is nothing extra to migrate.

The old top-level `svgoOptions` config has been removed.

If you still need custom `SVGO` behavior, use `bakerOptions.svgoOptions`, available since `v1.7.0`.

```ts {4-6,12-16}
// before
createSvgIconsPlugin({
  iconDirs: ['src/icons'],
  svgoOptions: {
    plugins: [{ name: 'convertStyleToAttrs' }],
  },
})

// after
createSvgIconsPlugin({
  iconDirs: ['src/icons'],
  bakerOptions: {
    svgoOptions: {
      plugins: [{ name: 'convertStyleToAttrs' }],
    },
  },
})
```

## Notable Changes

### Automatic `index.html` injection

Since `v1.7.0`, the SVG sprite is injected into `index.html` by default. See [htmlMode](./options.html#htmlmode).

### Vite-relative icon directory support

Since `v1.8.0`, relative `iconDirs` are resolved from the Vite `root`, so you no longer need patterns like `path.resolve` or `process.cwd`. This is especially useful in monorepos.

## Advanced

The new plugin uses [`svg-icon-baker`](https://www.npmjs.com/package/svg-icon-baker) under the hood to process SVG content.

- It applies `SVGO`-based optimization.
- It handles `id` namespacing and related details internally.

In a few edge-case SVGs, the output can differ from the old plugin. If a migrated project renders some legacy SVGs differently than expected, first check the source SVG content and any custom `svgoOptions`.

## Migration Checklist

- Switched to `vite-plugin-svg-icons-ng`
- Replaced deprecated virtual module ids with the new ids
- If you used custom `svgoOptions`, moved them to `bakerOptions.svgoOptions`
