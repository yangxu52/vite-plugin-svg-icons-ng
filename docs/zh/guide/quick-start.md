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

## 使用

在 `vite.config.ts` / `vite.config.js` 中配置插件：

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

此时 SVG精灵已经生成并注入到DOM中，可以通过全局组件使用（[组件样例](/zh/guide/component/index)）。

或者，直接在HTML中使用：

```html
<svg>
  <use xlink:href="#icon-icon1"></use>
</svg>
```

### 获取所有 Symbol ID

通过导入 `virtual:svg-icons/ids` 模块获取所有已生成的 symbol ID：

```ts
import ids from 'virtual:svg-icons/ids'
console.log(ids) // ['icon-icon1', 'icon-icon2', ...]
```

> 旧模块 `virtual:svg-icons-names` 将在 `v2.0.0` 删除。

### SSR

如果你的应用是服务端渲染，请阅读 [SSR 指南](/zh/guide/ssr)。
