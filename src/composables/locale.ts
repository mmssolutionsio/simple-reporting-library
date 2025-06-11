import useConfig from './config';
import { computed } from 'vue';

const config = useConfig();
const locale = computed<string>(() => config.value.locale);
export default function useLocale() {
  return locale;
}
