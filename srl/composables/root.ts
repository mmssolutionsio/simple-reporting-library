import SrlPageApp from '#components/Srl/Page/App.vue';
import { getCurrentInstance } from 'vue';

export default function useRoot(): typeof SrlPageApp {
  const { proxy } = getCurrentInstance() || {};
  return proxy?.$root;
}
