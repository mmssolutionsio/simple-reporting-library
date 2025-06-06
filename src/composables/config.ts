/**
 * `config.ts`
 *
 * This Vue 3 composable provides access to application configuration data.
 * It loads settings and localized content from JSON files and maintains
 * a reactive configuration state for the application.
 *
 * ## Imports
 * - `ref`: Vue reactivity API for creating reactive references
 *
 * ## Reactive State
 * - `config`: Reactive reference containing application configuration:
 *   - `loaded`: Boolean flag indicating if config has been loaded
 *   - `locale`: Current active language
 *   - `settings`: Application settings (languages, search options, etc.)
 *   - `articles`: Localized article content
 *   - `menus`: Localized menu structures
 *
 * ## Functions
 * - `getData()`: Asynchronously loads configuration from JSON files
 * - `useConfig()`: Main composable function that ensures config is loaded
 * - `isPreview()`: Determines if application is running in preview mode
 * - `isDevelopment()`: Determines if application is running in development mode
 * - `isWorkboxEnabled()`: Determines if Workbox service worker should be enabled
 *
 * ## Exports
 * - Default export: useConfig function
 * - Named exports: useConfig, isPreview, isDevelopment
 *
 * ## Usage Example
 * ```typescript
 * const config = await useConfig()
 * console.log(config.value.locale) // Current language
 */
import { ref } from 'vue'

const config = ref<NsWowConfig>({
  loaded: false,
  locale: 'de',
  settings: {
    languages: ['de', 'en'],
    defaultLanguage: 'de',
    shortBreadcrumb: false,
    search: {
      boldTheWord: true
    },
    categories: []
  },
  articles: {},
  menus: {}
})

async function getData() {
  const file = `./json/settings.json`
  try {
    const response: Response = await fetch(file)
    const lazySettings: NsWowSettings = await response.json()
    config.value.settings = Object.assign(config.value.settings, lazySettings)
    config.value.locale = lazySettings.defaultLanguage
  } catch (e) {
    console.error(`"${file}" could not be loaded.`)
  }

  for (const locale of config.value.settings.languages) {
    const file: string = `./json/routing_${locale}.json`
    try {
      const response: Response = await fetch(file)
      const routing: NsWowResponseRouting = await response.json()
      config.value.articles[locale] = routing.pages
      config.value.menus[locale] = routing.menu
    } catch (e) {
      console.error(`"${file}" could not be loaded.`)
    }
  }

  config.value.loaded = true
}

async function useConfig() {
  if (!config.value.loaded) {
    await getData()
  }
  return config
}

function isPreview(): boolean {
  return window.location.pathname.includes('/preview/')
}

function isDevelopment(): boolean {
  return import.meta.env.DEV
}

function isWorkboxEnabled(): boolean {
  return (!isPreview() && !isDevelopment()) || (isDevelopment() && import.meta.env.VITE_WORKBOX === 'true')
}

export default useConfig
export { useConfig, isPreview, isDevelopment }