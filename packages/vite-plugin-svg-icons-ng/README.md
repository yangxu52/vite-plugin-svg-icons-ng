# vite-plugin-svg-icons-ng

> A high-performance SVG icon plugin for Vite.
>
> Automatically generates SVG sprites from files and injects them at runtime, making icon usage simpler and more efficient.

[Documentation](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/) | [中文文档](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/zh/)

## Install

```sh
pnpm add -D vite-plugin-svg-icons-ng
```

## Quick Start

```ts
import { defineConfig } from 'vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng'
import path from 'node:path'

export default defineConfig({
  plugins: [
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/icons')],
    }),
  ],
})
```

At this point, the plugin can generate the SVG sprite and expose it through the standard Vite flow.

In development, import `virtual:svg-icons/register` to mount it on the client and receive in-place HMR updates.

Use icons directly in templates, or encapsulate them in reusable components.

See [Component Usage](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/guide/component/) for framework examples.

```html
<svg aria-hidden="true">
  <use xlink:href="#icon-icon1"></use>
</svg>
```

## Highlights

- File-based SVG icons with automatic sprite generation
- Dev mount + build HTML injection with no extra network request
- Cached compilation with HMR support
- Consistent output across dev, build, and SSR flows
- Virtual modules for register, ids, and SSR sprite access

## Virtual Modules

- `virtual:svg-icons/register`: mount the sprite on the client and keep it updated during dev HMR
- `virtual:svg-icons/ids`: read all generated symbol ids
- `virtual:svg-icons/sprite`: read sprite markup for SSR template injection

## Compatibility

Deprecated virtual module ids are removed in `v2.0.0`:

- `virtual:svg-icons-register` -> `virtual:svg-icons/register`
- `virtual:svg-icons-names` -> `virtual:svg-icons/ids`

## Docs

- [Getting Started](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/guide/)
- [Usage Guide](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/guide/usage)
- [Options](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/guide/options)
- [SSR Guide](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/guide/ssr)
