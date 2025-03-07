<script setup lang="ts">
import { computed } from 'vue'
defineOptions({ name: 'SvgIcon', inheritAttrs: false })
const props = defineProps({
  name: { type: String, required: true },
  prefix: { type: String, default: 'icon' }, // common prefix, simplify  usage
  color: { type: String, default: '#333' }, // fill color
})
const symbolId = computed(() => `#${props.prefix}-${props.name}`)
</script>

<template>
  <svg class="svg-icon" aria-hidden="true">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<style scoped>
.svg-icon {
  width: 8em;
  height: 8em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  /**
   * custom icon common style
   */
}
</style>
