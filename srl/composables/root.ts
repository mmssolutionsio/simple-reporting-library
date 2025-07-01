import SrlPageApp from '#components/Srl/Page/App.vue';

export default function useRoot(): typeof SrlPageApp {
  return window.app._instance.root.setupState
}
