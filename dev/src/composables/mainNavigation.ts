import { computed } from 'vue'
import { isDesktopView } from '@/composables/isDesktopView.ts'

const mainNavigation = computed<HTMLDivElement | HTMLButtonElement | null>(() => {
  return isDesktopView.value ?
      document.querySelector('#srl-page-navigation > ul'):
      document.querySelector('#srl-header__toggle')
})
export function useMainNavigation() {
  return mainNavigation
}