import useConfig from './config';
import { computed } from 'vue';

const config = useConfig();

const settings = computed<NsWowSettings>(() => config.value.settings);
export default function useSettings() {
  return settings;
}
