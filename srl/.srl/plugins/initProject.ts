import { setConfig } from '#composables/config';
import { setInstance } from '#composables/instance.ts'
import { createApp, defineAsyncComponent } from 'vue';
import { initI18n } from '@/i18n';
import srlVuePlugin from '#plugins/vueSrlPlugin';
import { clearPageState } from '#utils'
import Translate from '@/i18n/translation.ts'


import '#imports/app.scss';

import SrlPageApp from '../App.vue';
import router from '@/router';

export default async function initProject() {
    const config = await setConfig();
    router.beforeEach((to, from, next) => {
        clearPageState();
        next();
    });
    router.afterEach(() => {
        if (
          router.currentRoute.value.params.locale
          && config.value.locale !== router.currentRoute.value.params.locale
        ) {
            Translate.switchLanguage(router.currentRoute.value.params.locale as string);
        }
    })
    const i18n = initI18n();
    const app = (window.app = createApp(SrlPageApp));
    app.use(i18n);
    app.use(router);
    app.use(srlVuePlugin);
    app.component('Swiper', defineAsyncComponent(() => import('swiper/vue').then(mod => mod.Swiper)))
    app.component('SwiperSlide', defineAsyncComponent(() => import('swiper/vue').then(mod => mod.SwiperSlide)))
    setInstance(app);
    return app;
}
