# 为什么选择它

## 现实问题

在真实业务里，图标通常会变成一类“高频但琐碎”的问题：

- 图标文件分散、命名不统一，依赖手动导入和维护路径。
- 经常退回到 `<img src>` 或零散 inline SVG，复用成本高。
- 颜色、尺寸和响应式控制不统一，样式治理困难。
- 开发、构建、SSR 各阶段行为可能不一致，排查成本高。

问题并不在 SVG 本身，而在于图标流程没有成为构建体系的一部分。

## 为什么会有 `vite-plugin-svg-icons-ng`

`vite-plugin-svg-icons-ng` 的目标是把图标能力标准化：

- 以本地 SVG 文件作为唯一来源。
- 自动生成 SVG 精灵，不再手动维护产物。
- 用统一方式注入与消费图标。
- 借助缓存与 HMR 提升开发反馈速度。

核心诉求很直接：让图标从“需要管理的资源”，变成“可以直接使用的能力”。

## 与 `vite-plugin-svg-icons` 的关系

- 本项目受到 [`vite-plugin-svg-icons`](https://github.com/vbenjs/vite-plugin-svg-icons) 的启发，并延续其基于 sprite 的核心思路。
- `vite-plugin-svg-icons-ng` 在此基础上做了新的实现与文档组织，面向本仓库持续演进。
- 为降低迁移成本，保留了旧 virtual module id 的过渡路径，同时推荐使用新 id：
  - `virtual:svg-icons/register`
  - `virtual:svg-icons/ids`
