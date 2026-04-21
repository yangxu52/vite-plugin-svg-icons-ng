# Getting Started

## Overview

`vite-plugin-svg-icons-ng` is a high-performance SVG icon plugin built for Vite.

It automatically generates SVG sprites from local files and injects them at runtime, allowing you to use SVG icons as easily as regular icons.

No manual sprite management, no extra requests, and no complex setup—just a clean and reusable icon system.

### What you get

- File-based icon input, auto-generated SVG sprite output.
- Dev client mount with no extra network request
- Build can inline the same sprite output.
- Stable behavior across dev, build, and SSR flows.
- Built-in cache + HMR for a smoother icon iteration loop.

If you want the background story, read [Why This Plugin](/guide/why).

## Quick Start

### Step 1: Install

::: code-group

```sh [pnpm]
pnpm add -D vite-plugin-svg-icons-ng
```

```sh [npm]
npm i -D vite-plugin-svg-icons-ng
```

```sh [yarn]
yarn add -D vite-plugin-svg-icons-ng
```

:::

### Step 2: Configure plugin

Add `createSvgIconsPlugin` in `vite.config.ts` / `vite.config.js`:

```ts {1,5-7}
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng'

export default defineConfig({
  plugins: [
    createSvgIconsPlugin({
      iconDirs: ['src/icons'],
    }),
  ],
})
```

At this point, the SVG sprite can already be generated from your icon directories.

> [!NOTE]
> Path resolution follows Vite: relative `iconDirs` are resolved from your Vite project [`root`](https://vite.dev/config/shared-options#root), while absolute paths are used as written.
> In monorepos, use an absolute path when the icon folder lives outside the current app root.

> [!TIP]
> Import `virtual:svg-icons/register` from your client entry when you want the sprite mounted in development and updated in place during HMR.

### Step 3: Continue

- Go to [Usage](/guide/usage) to see how to use it next.
- Check [Options](/guide/options) for plugin configuration details.
