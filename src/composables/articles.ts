/**
 * `articles.ts`
 *
 * This Vue 3 composable provides access to localized article data.
 * It implements a singleton pattern to ensure only one computed reference
 * is created and reused across the application.
 *
 * ## Imports
 * - `useConfig`: Composable for accessing application configuration
 * - `computed`, `ComputedRef`: Vue reactivity utilities
 *
 * ## Variables
 * - `computedStorage`: Singleton storage for the computed article reference
 *
 * ## Function: useArticles
 * - Asynchronous function that returns a computed reference to articles
 * - Only initializes the computed reference on first call
 * - Returns the same reference on subsequent calls
 * - Articles are filtered by the current locale from the configuration
 *
 * ## Return Value
 * - ComputedRef<NsWowArticle[]>: A computed reference to an array of articles
 *   in the current locale
 *
 * ## Usage Example
 * ```typescript
 * const articles = await useArticles()
 * console.log(articles.value) // Array of articles in the current locale
 */
import { computed, type ComputedRef } from 'vue'
import useConfig from './config'

let computedStorage: ComputedRef<NsWowArticle[]>

export default async function useArticles() {
  if (!computedStorage) {
    const config = await useConfig()
    computedStorage = computed<NsWowArticle[]>(() => config.value?.articles[config.value.locale])
  }
  return computedStorage
}