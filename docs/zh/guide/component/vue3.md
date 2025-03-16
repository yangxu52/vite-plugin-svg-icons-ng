# Vue3

## 组件参考

示例：`/src/components/SvgIcon.vue`

::: code-group

```Vue [Composition]
<script setup>
defineOptions({ name: 'SvgIcon', inheritAttrs: false })
const props = defineProps({
  name: { type: String, required: true },
})
</script>
<template>
  <svg class="svg-icon" aria-hidden="true">
    <use :xlink:href="props.name" />
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

```Vue [Options]
<template>
  <svg class="svg-icon" aria-hidden="true">
    <use :href="props.name" />
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

:::

## 使用参考

示例：`/src/app.vue`

::: code-group

```Vue [Composition]
<script setup>
import SvgIcon from './components/SvgIcon.vue'
</script>
<template>
  <div>
    <SvgIcon name="icon-icon1"></SvgIcon>
    <SvgIcon name="icon-icon2" style="color: #8B81C3"></SvgIcon>
    <SvgIcon name="icon-dir-icon1"></SvgIcon>
  </div>
</template>
```

```Vue [Options]
<template>
  <div>
    <SvgIcon name="icon-icon1"></SvgIcon>
    <SvgIcon name="icon-icon2" style="color: #8B81C3"></SvgIcon>
    <SvgIcon name="icon-dir-icon1"></SvgIcon>
  </div>
</template>
<script>
import SvgIcon from './components/SvgIcon.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: { SvgIcon },
})
</script>
```

:::
