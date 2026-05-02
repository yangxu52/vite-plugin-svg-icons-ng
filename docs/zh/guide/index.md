# 开始

## 概览

`vite-plugin-svg-icons-ng` 是一个专为 Vite 打造的高性能 SVG 图标插件。
它会从本地 SVG 文件自动生成 SVG 精灵，并在运行时进行可配置的注入，让你可以像使用普通图标一样高效地使用 SVG。
无需手动维护 sprite，无需额外请求，也无需复杂配置，即可构建一套统一、可复用的图标系统。

### 你将获得什么

- 以文件为输入，自动生成 SVG 精灵。
- 支持 `script`、`inline`、`none` 三种 HTML 生成策略。
- 可选的客户端挂载能力，无额外网络请求。
- 在 dev / build / SSR 下保持稳定一致的行为。
- 内置缓存与 HMR，图标迭代更流畅。

如果你想先了解背景和动机，请阅读 [为什么选择它](/zh/guide/why)。

## 快速开始

### 第一步：安装

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

### 第二步：配置插件

在 `vite.config.ts` / `vite.config.js` 中添加 `createSvgIconsPlugin`：

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

此时插件已经可以根据图标目录生成 SVG 精灵。

> [!NOTE] 注意
> 路径解析跟随 Vite：相对 `iconDirs` 会基于当前 Vite 项目的 [`root`](https://cn.vite.dev/config/shared-options#root) 解析，绝对路径则按原样使用。  
> 在 monorepo 中，如果图标目录位于当前 app root 之外，请使用绝对路径。

> [!TIP] 提示
> 默认使用 `htmlMode: 'inline'`，会直接把 sprite 注入 HTML。  
> 需要运行时挂载和开发环境更新时，可用 `htmlMode: 'script'`。使用 `virtual:svg-icons/register` 时，推荐将 `htmlMode` 设为 `none`。

### 第三步：继续

- 前往 [使用指南](/zh/guide/usage) 查看如何后续使用。
- 插件配置选项细节见 [插件选项](/zh/guide/options)。
