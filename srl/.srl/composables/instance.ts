import { ref } from 'vue';
const app = ref();

export function setInstance(instance) {
  app.value = instance;
}
export function useInstance() {
  return app;
}
export default {
  setInstance,
  useInstance,
}