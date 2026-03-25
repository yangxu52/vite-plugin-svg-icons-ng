# 使用指南

本页聚焦在插件“安装并配置完成之后”，你可以做什么、怎么做。

如果尚未完成配置，请先阅读 [开始](/zh/guide/)。

### 假设

你的图标目录文件结构如下：

```txt
src/icons/
├── dir/icon1.svg
├── icon1.svg
└── icon2.svg
```

插件配置项 `symbolId:`为默认的：`icon-[dir]-[name]`

## 在模板中直接使用图标

```html
<svg aria-hidden="true">
  <use xlink:href="#icon-icon1"></use>
</svg>

<svg aria-hidden="true">
  <use xlink:href="#icon-dir-icon1"></use>
</svg>
```

## 封装可复用组件

避免在业务页面重复写 `<svg><use /></svg>`，建议封装组件后统一复用。

可参考 [组件使用](/zh/guide/component/)。

## 虚拟模块

如果你需要获取全部图标 id、在客户端入口手动注入 sprite，或者在 SSR 中读取 sprite 字符串，请查看 [虚拟模块](/zh/guide/virtual-module)。
