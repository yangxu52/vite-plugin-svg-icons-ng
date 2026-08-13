# Migration

Source: `<Documentation site>/guide/migration`. Use this reference when replacing the old `vite-plugin-svg-icons` package.

## Basic replacement

```sh
pnpm remove vite-plugin-svg-icons && pnpm add -D vite-plugin-svg-icons-ng
# or: npm remove vite-plugin-svg-icons && npm i -D vite-plugin-svg-icons-ng
# or: yarn remove vite-plugin-svg-icons && yarn add -D vite-plugin-svg-icons-ng
```

For most projects using Vite >= 5 and no custom `svgoOptions`, preserve the existing icon directories, `symbolId`, and business-side icon references.

## Required compatibility checks

- Upgrade Vite 2/3/4 projects to Vite >= 5 first.
- Vite 5 requires a supported Node.js line (the docs list 18/20/22+), and projects using the Node API should account for the ESM/CJS change.
- Replace deprecated virtual module IDs before v2:
  - `virtual:svg-icons-register` -> `virtual:svg-icons/register`
  - `virtual:svg-icons-names` -> `virtual:svg-icons/ids`
- If the old project configured top-level `svgoOptions`, move it under `bakerOptions.svgoOptions`.

```ts
createSvgIconsPlugin({
  iconDirs: ['src/icons'],
  bakerOptions: {
    svgoOptions: {
      plugins: [{ name: 'convertStyleToAttrs' }],
    },
  },
})
```

Projects without custom `svgoOptions` do not need to add `bakerOptions` just for migration.

## Behavior to recheck

The plugin automatically injects the SVG sprite into `index.html` by default, and relative `iconDirs` paths resolve through the Vite `root`. Rare SVGs can render differently after migration; inspect the source SVG and custom SVGO settings first.

## Migration checklist

- Package switched to `vite-plugin-svg-icons-ng`.
- Deprecated virtual module IDs replaced.
- Any custom `svgoOptions` moved to `bakerOptions.svgoOptions`.
