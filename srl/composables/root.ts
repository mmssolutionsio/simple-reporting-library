import SrlPageApp from '#components/Srl/Page/App.vue';
import { getCurrentInstance } from 'vue';

export default function useRoot(): typeof SrlPageApp {
  const instance = getCurrentInstance();
  return instance?.proxy?.$root ?? window.app._instance.root.setupState;
}
