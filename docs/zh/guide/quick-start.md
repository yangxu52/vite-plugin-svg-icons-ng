# 快速开始

## 安装

### 前置条件

- [Node.js](https://nodejs.org) 版本 18 或更高 LTS
- [Vite](https://vitejs.dev) 版本 5 或更高

运行以下命令安装，并且确保你的工作区配置正确：

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

在`vite.config.ts`/`vite.config.js`中导入并配置插件

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

接着，在`main.ts`/`main.js`导入虚拟模块`virtual:svg-icons/register`

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

> [!CAUTION] WARNING !
> 虚拟模块 `virtual:svg-icons-register` 将在未来的版本中废弃，  
> 因为它不符合虚拟模块的[命名空间规范](https://vite.dev/guide/api-plugin#virtual-modules-convention)。  
> 使用 `virtual:svg-icons/register` 代替。

至此，svg精灵已经生成并注入到HTML中，可以通过全局组件使用（[组件样例](/zh/guide/component/index)）。

或者，直接在HTML中使用：

```html
<svg>
  <use xlink:href="#icon-icon1"></use>
</svg>
```

## 获取SymbolId

可以通过`virtual:svg-icons/ids`获取所有SymbolId的数组

```ts
import ids from 'virtual:svg-icons/ids' // recommended // [!code ++]
import ids from 'virtual:svg-icons-names' //deprecated // [!code --]
console.log(ids) // ['icon-icon1','icon-icon2','icon-icon3']
```

> [!CAUTION] WARNING !
> 虚拟模块 `virtual:svg-icons-names` 将在未来的版本中废弃，  
> 因为它不符合虚拟模块的[命名空间规范](https://vite.dev/guide/api-plugin#virtual-modules-convention)。  
> 应该使用 `virtual:svg-icons/ids` 代替。
