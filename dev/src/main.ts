
import { setConfig, useConfig } from '#composables/config'
import { createApp } from 'vue';
import { initI18n } from './i18n'
import srlVuePlugin from '#plugins/vueSrlPlugin'

import '#imports/app.scss'

import SrlPageApp from '#components/Srl/Page/App.vue';
import router from './router'

const init = new Promise(async resolve => {
  const config = await setConfig()
  resolve(config)
})

init
  .then(async config => {
    const i18n = initI18n()
    const app = createApp(SrlPageApp)
    app.use(i18n)
    app.use(router)
    app.use(srlVuePlugin)
    app.mount('#app')
  })
  .catch(error => {
    console.error('Error initializing app:', error);
  });
