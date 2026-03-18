import { computed, ref, watch } from 'vue'
import { config } from './config'

export const settings = ref<SrlDevToolsSettings>(config.value.defaultSettings)

const storedSettings = localStorage.getItem(config.value.settingsNamespace)
if (storedSettings) {
  try {
    settings.value = JSON.parse(storedSettings)
  } catch {}
}

watch(
  settings.value,
  (newSettings) => {
    localStorage.setItem(config.value.settingsNamespace, JSON.stringify(newSettings))
  },
  { immediate: true }
)

export const isDefaultSettings = computed(() => {
  return JSON.stringify(settings.value) === JSON.stringify(config.value.defaultSettings)
})

export default {
  settings,
  isDefaultSettings,
}