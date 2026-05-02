# vite-plugin-svg-icons-ng

> A high-performance SVG icon plugin for Vite.
>
> Automatically generates SVG sprites from files and configurable injects them at runtime, making icon usage simpler and more efficient.

[Documentation](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/) | [中文文档](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/zh/)

## Install

```sh
pnpm add -D vite-plugin-svg-icons-ng
```

## Quick Start

```ts
import { defineConfig } from 'vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng'

export default defineConfig({
  plugins: [
    createSvgIconsPlugin({
      iconDirs: ['src/icons'],
    }),
  ],
})
```

At this point, the plugin can generate the SVG sprite and expose it through the standard Vite HTML flow.

Path resolution follows Vite: relative `iconDirs` are resolved from your Vite project root, while absolute paths are used as written. In monorepos, use an absolute path when the icon folder lives outside the current app root.

Default: `htmlMode: 'inline'`, which injects the sprite into HTML. Use `script` for runtime mount + dev HMR, or `none` to disable automatic HTML injection.

If you use `virtual:svg-icons/register`, prefer `htmlMode: 'none'` to disable automatic HTML injection.

Use icons directly in templates, or encapsulate them in reusable components.

See [Component Usage](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/guide/component/) for framework examples.

```html
<svg aria-hidden="true">
  <use xlink:href="#icon-icon1"></use>
</svg>
```

## Highlights

- File-based SVG icons with automatic sprite generation
- Configurable HTML generation: `script` / `inline` / `none`
- Cached compilation with HMR support
- Consistent output across dev, build, and SSR flows
- Safer icon sets with duplicate `symbolId` detection and optional build failure
- Virtual modules for register, ids, and SSR sprite access

## Virtual Modules

- `virtual:svg-icons/register`: explicitly mount the sprite from a client entry
- `virtual:svg-icons/ids`: read all generated symbol ids
- `virtual:svg-icons/sprite`: read sprite markup for SSR template injection

## Compatibility

Deprecated virtual module ids are still supported in the current release and are planned for removal in `v2.0.0`:

- `virtual:svg-icons-register` -> `virtual:svg-icons/register`
- `virtual:svg-icons-names` -> `virtual:svg-icons/ids`

Migration: update imports to the new slash-based virtual module ids before upgrading to `v2.0.0`.

## Docs

- [Getting Started](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/guide/)
- [Usage Guide](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/guide/usage)
- [Options](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/guide/options)
- [SSR Guide](https://blog.yangxu52.top/vite-plugin-svg-icons-ng/guide/ssr)
