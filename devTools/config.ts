import { computed, ref } from 'vue'

export const config = ref<{
  settingsNamespace: string
  positions: Array<'top-right' | 'top-left'| 'bottom-right' | 'bottom-left'>
  fontSizes: Record<string, number>
  defaultSettings: SrlDevToolsSettings
}>({
  settingsNamespace: 'srl-dev-tools-settings',
  positions: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
  fontSizes: {
    S: 12,
    M: 14,
    L: 16,
    XL: 18,
  },
  defaultSettings: {
    active: true,
    size: 'S',
    position: 'top-right',
    opacity: 1,
    darkMode: false,
    overlay: {
      grid: false,
    },
  },
})

export const sizeOptions = computed(() => Object.keys(config.value.fontSizes))

export default {
  config,
  sizeOptions,
}