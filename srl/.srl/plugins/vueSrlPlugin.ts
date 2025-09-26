import { type App } from 'vue'
import asyncLdComponent from './asyncLdComponent.ts';
import asyncSrlComponents from '#plugins/asyncSrlComponents.ts';

export default {
  install(app: App) {
    asyncSrlComponents(app)
    asyncLdComponent(app);
  },
};
