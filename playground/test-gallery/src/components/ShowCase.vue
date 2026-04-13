<script setup lang="ts">
import SvgIcon from './SvgIcon.vue'

interface Props {
  group: string
  icons: string[]
}
defineProps<Props>()
</script>

<template>
  <div>
    <div class="title">{{ group.toUpperCase() }}</div>
    <div class="content">
      <template v-for="id in icons.filter((id) => id.startsWith(`icon-${group}`))" :key="id">
        <SvgIcon :name="id" />
      </template>
    </div>
  </div>
</template>

<style>
.title {
  font-size: 1rem;
  color: #333333;
  font-weight: bold;
}
.content {
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  row-gap: 1rem;
  column-gap: 1rem;
  justify-items: center;
}
</style>
