<script setup lang="ts">
import ShowCase from './components/ShowCase.vue'
import { ref, watch } from 'vue'

import ids from 'virtual:svg-icons/ids'

const sorted = Array.from(ids).sort((a, b) => a.localeCompare(b))

const fontSize = ref(8)
const color = ref('#2080f0')

watch(fontSize, (value) => {
  document.documentElement.style.setProperty('--font-size', `${value}rem`)
})
</script>

<template>
  <div class="wrapper">
    <div class="display">
      <ShowCase :icons="sorted" group="normal" />
      <ShowCase :icons="sorted" group="colorful" />
      <ShowCase :icons="sorted" group="animate" />
      <ShowCase :icons="sorted" group="complex" />
      <ShowCase :icons="sorted" group="regression" />
    </div>
    <div class="control">
      <!--      font-size-->
      <div class="control-item font-size">
        <label for="font-size">Font Size: {{ `${fontSize}rem` }}</label>
        <input type="range" id="font-size" min="1" max="10" v-model="fontSize" />
      </div>
      <div class="control-item color">
        <label for="color">Fill Color: {{ color }}</label>
        <input type="color" v-model="color" />
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --font-size: 8rem;
  * {
    box-sizing: border-box;
  }
}
.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
}
.display {
  flex: 1;
  font-size: var(--font-size);
  color: v-bind(color);
}
.control {
  width: 12rem;
}
.control-item {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}
</style>
