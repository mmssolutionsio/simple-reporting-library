/**
 * `src/composables/config.ts`
 *
 * A Vue 3 composable that manages the application configuration.
 * Handles loading and accessing various configuration aspects including
 * settings, translations, article data, and menu structures.
 *
 * ## Core Functionality
 * - Loads configuration from multiple JSON files
 * - Manages application settings and supported languages
 * - Handles internationalization with translations
 * - Provides routing information for different locales
 * - Manages downloadable content references
 * - Offers environment detection helpers
 *
 * ## Data Structure
 * - `NsWowConfig`: Main configuration object containing:
 *   - `locale`: Current active locale
 *   - `settings`: Application settings
 *   - `articles`: Article data by language
 *   - `menus`: Menu structures by language
 *   - `translations`: Translation strings by language
 *   - `downloads`: Download data by language
 *
 * ## Main Functions
 * - `setConfig()`: Initializes the full configuration by loading all data files
 * - `loadSettings()`: Loads application settings from JSON
 * - `loadTranslations()`: Loads translation data
 * - `loadRouting(locale)`: Loads routing information for specified locale
 * - `loadDownloads(locale)`: Loads download data for specified locale
 * - `useConfig()`: Returns the reactive configuration reference
 *
 * ## Environment Helpers
 * - `isPreview()`: Checks if application is running in preview mode
 * - `isDevelopment()`: Checks if application is running in development mode
 * - `isWorkboxEnabled()`: Determines if service worker functionality is enabled
 *
 * ## Usage
 * const config = useConfig()
 */
import { ref, type Ref } from 'vue'

const config = ref<NsWowConfig>({
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
  menus: {},
  translations: {},
  downloads: {}
})

async function setConfig(): Promise<Ref<NsWowConfig>> {
  await loadSettings()
  await loadTranslations()

  const defaultMessages = import.meta.glob('@/locales/*.json', {
    eager: true,
    import: 'default'
  })

  for (const locale of config.value.settings.languages) {
    await loadRouting(locale)
    await loadDownloads(locale)

    config.value.translations[locale] = config.value.translations[locale] || {}

    const defaultMessages = import.meta.glob('@/locales/*.json', {
      eager: true,
      import: 'default'
    })

    const path = `/src/locales/${locale}.json`
    if (defaultMessages[path]) {
      config.value.translations[locale] = Object.assign(
        defaultMessages[path],
        config.value.translations[locale]
      )
    }
  }
  return config
}

async function loadSettings() {
  const file = `./json/settings.json`
  try {
    const response: Response = await fetch(file)
    const data: NsWowSettings = await response.json()
    config.value.settings = Object.assign(config.value.settings, data)
    config.value.locale = data.defaultLanguage
    document.documentElement.lang = data.defaultLanguage
  } catch (e) {
    errorLog(`"${file}" could not be loaded.`, e)
  }
}

async function loadTranslations() {
  const file = `./json/translations_hosting.json`
  try {
    const response: Response = await fetch(file)
    const data: NsWowTranslations = await response.json()
    config.value.translations = data
  } catch (e) {
    errorLog(`"${file}" could not be loaded.`, e)
  }
}

async function loadRouting(locale: string) {
  const file: string = `./json/routing_${locale}.json`
  try {
    const response: Response = await fetch(file)
    const routing: NsWowResponseRouting = await response.json()
    config.value.articles[locale] = routing.pages
    config.value.menus[locale] = routing.menu
  } catch (e) {
    errorLog(`"${file}" could not be loaded.`, e)
  }
}

async function loadDownloads(locale: string) {
  config.value.downloads[locale] = {}
  const file: string = `./downloads/downloads_${locale}.json`
  try {
    const response: Response = await fetch(file)
    const data = await response.json()
    config.value.downloads[locale] = data
  } catch (e) {
    errorLog(`"${file}" could not be loaded.`, e)
  }
}

function useConfig() {
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

function errorLog(message: string, error: Error) {
  isDevelopment() || isPreview() ? console.error(`Error: ${message}`, error) : null
}

export default useConfig
export { setConfig, useConfig, isPreview, isDevelopment }