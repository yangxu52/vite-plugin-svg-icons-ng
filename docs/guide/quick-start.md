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

Import and configure the plugin in `vite.config.ts`/`vite.config.js`

::: code-group

```ts [vite.config.ts]{2,7-9} typescript
// ...
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng'
import path from 'node:path'

export default defineConfig({
  plugins: [
    // ...
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/icons')],
    }),
  ],
})
```

```js [vite.config.js]{2,7-9}
// ...
import path from 'node:path'

export default defineConfig({
  plugins: [
    // ...
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/icons')],
    }),
  ],
})
```

:::

Then, Import the virtual module in entry file, like `main.ts`/`main.js`.

::: code-group

```ts [main.ts]
import 'virtual:svg-icons/register' // recommended // [!code ++]
import 'virtual:svg-icons-register' // deprecated // [!code --]
```

```js [main.js]
import 'virtual:svg-icons/register' // recommended // [!code ++]
import 'virtual:svg-icons-register' // deprecated // [!code --]
```

:::

> [!CAUTION] WARN
> The virtual module `virtual:svg-icons-register` will be deprecated in the future.
> Because it doesn't comply with the namespace specification.  
> You can use `import 'virtual:svg-icons/register'` instead.

Here, the svg sprite will have been generated. Can use through public [component](/guide/component/index).

Or can use the sprite directly in the HTML.

```html
<svg>
  <use xlink:href="#icon-icon1"></use>
</svg>
```

## Get all SymbolId

Can get all SymbolId through `virtual:svg-icons/ids`

```ts
import ids from 'virtual:svg-icons/ids' // recommended // [!code ++]
import ids from 'virtual:svg-icons-names' //deprecated // [!code --]
console.log(ids) // ['icon-icon1','icon-icon2','icon-icon3']
```

> [!CAUTION] WARN
> The virtual module `virtual:svg-icons-names` will be deprecated in the future.
> Because it doesn't comply with the namespace specification.  
> You can use `import ids from 'virtual:svg-icons/ids'` instead.
