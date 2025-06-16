import useConfig from './config';
import { computed, ComputedRef } from 'vue';

const config = useConfig();

const settings = computed<NsWowSettings>(() => config.value.settings);
export default function useSettings(): ComputedRef<NsWowSettings> {
  return settings;
}
