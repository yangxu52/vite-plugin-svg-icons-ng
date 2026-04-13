import { createApp } from 'vue'
import App from './App.vue'

import 'virtual:svg-icons/register'

import allKeys from 'virtual:svg-icons/ids'

console.log(allKeys)

const app = createApp(App)

app.mount('#app')
