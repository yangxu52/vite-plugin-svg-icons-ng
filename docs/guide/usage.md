# Usage

This page focuses on what you can do **after** the plugin is installed and configured.

If not configured yet, finish [Getting Started](/guide/) first.

### Assumption

Your icon directory structure looks like this:

```txt
src/icons/
├── dir/icon1.svg
├── icon1.svg
└── icon2.svg
```

The plugin option `symbolId` uses the default value: `icon-[dir]-[name]`.

## Use icons directly in templates

```html
<svg aria-hidden="true">
  <use xlink:href="#icon-icon1"></use>
</svg>

<svg aria-hidden="true">
  <use xlink:href="#icon-dir-icon1"></use>
</svg>
```

## Build reusable framework components

Instead of repeating raw `<svg><use /></svg>`, wrap it in a component and reuse it across pages.

See [Component Examples](/guide/component/).

## Virtual Module

If you need to read all generated icon ids, register the sprite manually from a client entry, or read the sprite string in SSR, see [Virtual Module](/guide/virtual-module).
