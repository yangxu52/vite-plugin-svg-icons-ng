# Direct usage and components

Sources: `<Documentation site>/guide/usage`, `<Documentation site>/guide/component/`, `<Documentation site>/guide/component/vue3`, and `<Documentation site>/guide/component/react`.

Before using an icon, complete the getting-started configuration and know the generated `symbolId`. With the default `symbolId: 'icon-[dir]-[name]'`, `src/icons/icon1.svg` becomes `icon-icon1`, while `src/icons/dir/icon1.svg` becomes `icon-dir-icon1`.

## Direct usage

Use the generated symbol ID in a normal SVG reference:

```html
<svg aria-hidden="true">
  <use xlink:href="#icon-icon1"></use>
</svg>
```

Prefer a reusable component when the same markup appears across application pages.

## Vue 3 component

Use a required `name` prop and pass the generated ID to `<use>`:

```vue
<script setup>
defineOptions({ name: 'SvgIcon', inheritAttrs: false })
defineProps({
  name: { type: String, required: true },
})
</script>

<template>
  <svg class="svg-icon" aria-hidden="true">
    <use :href="`#${name}`" />
  </svg>
</template>

<style>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
```

Options API variant:

```vue
<template>
  <svg class="svg-icon" aria-hidden="true">
    <use :href="`#${name}`" />
  </svg>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SvgIcon',
  props: {
    name: { type: String, required: true },
  },
})
</script>
```

Example calls:

```vue
<SvgIcon name="icon-icon1" />
<SvgIcon name="icon-icon2" style="color: #8B81C3" />
<SvgIcon name="icon-dir-icon1" />
```

## React component

The documented React shape forwards SVG attributes and accepts a color prop:

```jsx
export default function SvgIcon({ name, color, ...props }) {
  return (
    <svg {...props} aria-hidden='true'>
      <use href={`#${name}`} fill={color} />
    </svg>
  )
}
```

Example calls:

```jsx
<SvgIcon name="icon-icon1" />
<SvgIcon name="icon-icon1" color="#8B81C3" />
<SvgIcon name="icon-dir-icon1" />
```
