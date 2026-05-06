# 从旧插件迁移

本文说明如何从旧版 `vite-plugin-svg-icons` 迁移到 `vite-plugin-svg-icons-ng`。

## 概述

在大多数项目中，直接替换插件，即可完成迁移：
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

> 在大多数项目中（Vite >= 5 且无 svgoOptions 配置），原有**配置**和**使用方式**无需任何改动即可**兼容**运行。

这意味着：

- **不改变**原有图标目录组织方式。
- **不改变**原有 `symbolId` 规则。
- **不改变**原有业务侧的图标引用方式。

---

只有两类内容建议你主动检查并迁移：

- [废弃旧虚拟模块名称](#废弃旧虚拟模块名称)（将于 v2 删除）
- [`svgoOptions` 高级配置写法](#迁移-svgooptions)（仅在实际使用过时才需要迁移）

如果你的项目仍在使用 Vite 2 / 3 / 4，则参考 Vite 迁移指南，升级至 Vite 5 / 6。

## Vite 支持

`vite-plugin-svg-icons-ng` 不再支持“上个世代”的 Vite 2 / 3 / 4，现在需要 Vite >=5。

- Vite 5 不再支持已结束生命周期（EOL）的 Node.js 14 / 16 / 17 / 19，现在需要 Node.js 18 / 20 / 22+。
- Vite 5 已经废弃 CJS 的 Node API，建议显式在 `package.json` 配置 `"type": "module"`（默认 `.js` 文件会被解释为 ESM，如有需要可以将文件重命名为 `.cjs` 扩展名来继续使用 CJS），否则会收到警告。

> 详见：[Vite：从 v4 迁移](https://v5.vite.dev/guide/migration)

## 废弃旧虚拟模块名称

旧的虚拟模块名称当前仍然保留兼容，但它们已经标记废弃（因不符合虚拟模块的命名空间规范），并计划在 `v2.0.0` 移除。

建议尽早将它们替换为新的写法：

- `virtual:svg-icons-register` -> `virtual:svg-icons/register`
- `virtual:svg-icons-names` -> `virtual:svg-icons/ids`

示例：

```ts
// 旧写法
import 'virtual:svg-icons-register'
import ids from 'virtual:svg-icons-names'
```

```ts
// 新写法
import 'virtual:svg-icons/register'
import ids from 'virtual:svg-icons/ids'
```

如果你当前仍在使用旧名称，现阶段不会立刻中断；但在升级到 `v2.0.0` 之前，建议先完成替换。

> [!TIP] 提示
> `v1.7.0` 开始默认将 SVG Sprite 自动注入 `index html`，即使不导入虚拟模块也可以获得 SVG Sprite。

## 迁移 `svgoOptions`

`svgoOptions` 属于高级用法，主要用于自定义 `SVGO` 优化行为。

如果没有显式配置过 `svgoOptions`，这一项可以直接忽略，不需要为了迁移额外补配置。

旧插件里常见的顶层 `svgoOptions` 配置，在本插件中已经删除。

如果你仍然需要自定义 `SVGO`，请改为使用 `v1.7.0` 提供的 `bakerOptions.svgoOptions`。

```ts {4-6,12-16}
// 迁移前
createSvgIconsPlugin({
  iconDirs: ['src/icons'],
  svgoOptions: {
    plugins: [{ name: 'convertStyleToAttrs' }],
  },
})

// 迁移后
createSvgIconsPlugin({
  iconDirs: ['src/icons'],
  bakerOptions: {
    svgoOptions: {
      plugins: [{ name: 'convertStyleToAttrs' }],
    },
  },
})
```

## 总体变化

### 自动注入 index html 支持

`v1.7.0` 开始默认将 SVG Sprite 自动注入 `index html`，详见 [htmlMode](./options.html#htmlmode)。

### Vite 相对路径支持

`v1.8.0` 开始支持通过 `vite root` 的相对路径来解析 `iconDirs`，不必要再写 `path.resolve` / `process.cwd` 等此类代码，这对 monorepo 项目十分有效。

## 进阶

新插件底层使用 [`svg-icon-baker`](https://www.npmjs.com/package/svg-icon-baker) 处理 SVG 内容。

- 会基于 `SVGO` 做优化处理。
- 会自行处理 `id` 命名空间等细节。

在极个别特殊 SVG 场景下，处理结果可能与旧插件存在差异。如果迁移后发现少数历史 SVG 的表现与预期不一致，优先检查原始 SVG 内容，以及是否使用了自定义 `svgoOptions`。

## 迁移检查清单

- 已切换到 `vite-plugin-svg-icons-ng`
- 已将旧虚拟模块名称替换为新名称
- 如果正在使用 `svgoOptions` 配置自定义 SVGO，已迁移到 `bakerOptions.svgoOptions`
