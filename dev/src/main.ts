import '../.nswow/app.scss'

import useConfig from '@/composables/config'
import { createApp } from 'vue'
import i18n from './i18n'

import App from './App.vue'
import router from './router'

useConfig().then(() => {
  const app = createApp(App)
  app.use(i18n)
  app.use(router)

  app.mount('#app')
  window.app = app
})
