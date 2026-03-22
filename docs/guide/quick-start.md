# Quick Start

## Installation

### Prerequisites

- [Node.js](https://nodejs.org) version 18 or higher LTS.
- [Vite](https://vitejs.dev) version 5 or higher.

Ensure that your workspace is set up correctly by running the following commands:

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

## Usage

Configure the plugin in `vite.config.ts` / `vite.config.js`:

::: code-group

```ts [vite.config.ts / vite.config.js]{1,7-10} typescript
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng'
import path from 'node:path'

export default defineConfig({
  plugins: [
    // ...
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/icons')],
      // other options
    }),
  ],
})
```

:::
Here, the svg sprite will have been generated and injected into the DOM.  
Can use through the public component ([Component Examples](/guide/component/index)).

Or can use the sprite directly in the HTML.

```html
<svg>
  <use xlink:href="#icon-icon1"></use>
</svg>
```

### Get All Symbol IDs

Import `virtual:svg-icons/ids` module to read all generated symbol IDs:

```ts
import ids from 'virtual:svg-icons/ids'
console.log(ids) // ['icon-icon1', 'icon-icon2', ...]
```

> Legacy id `virtual:svg-icons-names` will be removed in `v2.0.0`.

### SSR

If your app renders on the server, follow the dedicated [SSR Guide](/guide/ssr).
