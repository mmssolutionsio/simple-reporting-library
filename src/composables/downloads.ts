/**
 * `downloads.ts`
 *
 * This Vue 3 composable provides access to localized download data.
 * It loads download information from JSON files for each supported language
 * and returns a computed reference to the data in the current locale.
 *
 * ## Imports
 * - `computed`, `ref`, `ComputedRef`: Vue reactivity utilities
 * - `useConfig`: Composable for accessing application configuration
 *
 * ## Reactive Variables
 * - `downloads`: Reference object storing download data for all languages
 * - `computedDownloads`: Singleton computed reference for current locale's download data
 *
 * ## Function: useDownloads
 * - Asynchronous function that returns a computed reference to download data
 * - Loads download data JSON files for all configured languages on first call
 * - Initializes the computed reference if not already created
 * - Returns the same computed reference on subsequent calls
 * - Download data is filtered by the current locale from the configuration
 *
 * ## Return Value
 * - ComputedRef<NsWowDownloads>: A computed reference to download data
 *   in the current locale
 *
 * ## Usage Example
 * ```typescript
 * const downloads = await useDownloads()
 * console.log(downloads.value.structure) // Array of download structure items
 */
import { computed, ref, type ComputedRef } from 'vue'

const downloads = ref<{
  [key: string]: NsWowDownloads
}>()

let computedDownloads: ComputedRef<NsWowDownloads>

export default async function useDownloads() {
  const config = await useConfig()
  if (!downloads.value) {
    for (const lang of config.value.settings.languages) {
      const file = `./downloads/downloads_${lang}.json`
      try {
        const response: Response = await fetch(file)
        const lazyDownloads: NsWowDownloads = await response.json()
        if (!downloads.value) {
          downloads.value = {}
        }
        downloads.value[lang] = lazyDownloads
      } catch (e) {
        console.error(`"${file}" could not be loaded.`)
      }
    }
  }

  if (!computedDownloads) {
    computedDownloads = computed<NsWowDownloads>(() => {
      if (!downloads.value || !downloads.value[config.value.locale]) {
        return {
          structure: [],
          version: '',
          annualReport: undefined
        }
      }
      return downloads.value[config.value.locale]
    })
  }

  return computedDownloads
}