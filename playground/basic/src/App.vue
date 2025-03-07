<script setup>
import SvgIcon from './components/SvgIcon.vue'
</script>

<template>
  <div class="wrapper">
    <!-- normal usage -->
    <SvgIcon name="icon1" />
    <!-- fill color usage -->
    <SvgIcon name="bookmark" color="#ffc741" />
    <!-- custom prefix usage, has reference defs -->
    <SvgIcon name="position" />
    <!-- subdirectory icon, has colorful -->
    <SvgIcon name="color-folder" color="#ffc741" />
  </div>
</template>

<style>
:root {
  * {
    box-sizing: border-box;
  }
}
.wrapper {
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  row-gap: 1rem;
  column-gap: 1rem;
}
</style>
