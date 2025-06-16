import useConfig from './config';
import { computed, ComputedRef } from 'vue';

const config = useConfig();
const locale = computed<string>(() => config.value.locale);
export default function useLocale(): ComputedRef<string> {
  return locale;
}
