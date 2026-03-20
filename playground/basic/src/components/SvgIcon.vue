<script setup lang="ts">
defineOptions({ name: 'SvgIcon' })
const props = defineProps({
  name: { type: String, required: true },
})
</script>

<template>
  <svg class="svg-icon" aria-hidden="true">
    <use :href="`#${props.name}`" />
  </svg>
</template>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
