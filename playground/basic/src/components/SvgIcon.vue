<template>
  <svg class="app-svg-icon" :class="$attrs.class" aria-hidden="true">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'SvgIcon',
  inheritAttrs: false,
})
const props = defineProps({
  prefix: {
    type: String,
    default: 'icon',
  },
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#333',
  },
})
const symbolId = computed(() => `#${props.prefix}-${props.name}`)
</script>
