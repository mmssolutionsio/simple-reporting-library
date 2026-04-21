import { useViewPort } from '#composables'
import { computed } from 'vue'

const viewPort = useViewPort()

const desktopView = [
  "tablet-ls",
  "desktop",
  "desktop-large",
]

export const isDesktopView = computed(() => {
  return desktopView.includes(<string>viewPort.value.viewPort)
})

export default {
  isDesktopView,
}