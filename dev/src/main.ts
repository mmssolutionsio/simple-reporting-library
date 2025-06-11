import { setConfig } from '#composables/config'
import { createApp, defineAsyncComponent } from 'vue'
import { initI18n } from './i18n'
import srlVuePlugin from '#plugins/vueSrlPlugin'

import '#imports/app.scss'

import SrlPageApp from '#components/Srl/Page/App.vue'
import router from './router'
import asyncLddComponent from '#imports/asyncLddComponent.ts'

setConfig().then(() => {
  const i18n = initI18n()
  const app = createApp(SrlPageApp)
  app.use(i18n)
  app.use(router)
  app.use(srlVuePlugin)
  asyncLddComponent(app)
  app.mount('#app')
})
