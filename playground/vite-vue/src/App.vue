<script setup lang="ts">
import SvgIcon from './components/SvgIcon.vue'
import ids from 'virtual:svg-icons/ids'

const path = window.location.pathname
</script>

<template>
  <main>
    <h1>Playground - Vite Vue</h1>
    <p id="route">Route: {{ path }}</p>
    <p id="symbol-count">Symbol count: {{ ids.length }}</p>
    <SvgIcon name="icon-normal-gift" />
  </main>
</template>

<style>
body {
  margin: 0;
  padding: 32px;
}

main {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px;
  border: 1px solid #dfe3e8;
  border-radius: 16px;
}

h1 {
  text-align: center;
}

.svg-icon {
  font-size: 48px;
}
</style>
