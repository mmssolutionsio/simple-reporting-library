import { type App } from 'vue'
import asyncLdComponent from './asyncLdComponent.ts';
import asyncSrlComponents from '#plugins/asyncSrlComponents.ts';
import extensions from '../extensions.js';

export default {
  install(app: App) {
    asyncSrlComponents(app)
    asyncLdComponent(app);
    extensions.forEach((extension) => {
      if (extension.vuePlugin) {
        extension.vuePlugin(app);
      }
    });
  },
};
