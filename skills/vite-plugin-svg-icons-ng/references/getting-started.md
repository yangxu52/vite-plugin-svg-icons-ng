# Getting started

Source: `<Documentation site>/guide`. Use this reference for first-time consumer setup.

## Install

The package is a development dependency:

```sh
pnpm add -D vite-plugin-svg-icons-ng
# or: npm i -D vite-plugin-svg-icons-ng
# or: yarn add -D vite-plugin-svg-icons-ng
```

## Configure Vite

Add the plugin in `vite.config.ts` or `vite.config.js`:

```ts
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng'

export default defineConfig({
  plugins: [
    createSvgIconsPlugin({
      iconDirs: ['src/icons'],
    }),
  ],
})
```

The plugin builds an SVG sprite from the configured local SVG directory. Relative `iconDirs` paths resolve from the Vite project `root`; use an absolute path when a monorepo icon directory is outside the current app root.

The default `htmlMode: 'inline'` injects the sprite into generated HTML. Continue to the usage or options guide for other runtime arrangements.
