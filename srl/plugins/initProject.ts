import { setConfig } from '#composables/config'
import { createApp } from 'vue'
import { initI18n } from '@/i18n'
import srlVuePlugin from '#plugins/vueSrlPlugin'

import '#imports/app.scss'

import SrlPageApp from '#components/Srl/Page/App.vue'
import router from '@/router'

export default async function initProject() {
  await setConfig()
  const i18n = initI18n()
  const app = window.app = createApp(SrlPageApp)
  app.use(i18n)
  app.use(router)
  app.use(srlVuePlugin)
  return app
}
