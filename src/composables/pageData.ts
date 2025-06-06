/**
 * `pageData.ts`
 *
 * This Vue 3 composable provides a reactive data store for the current page information.
 * It implements a singleton pattern to maintain a consistent page data state across
 * the entire application.
 *
 * ## Imports
 * - `reactive`: Vue reactivity API for creating reactive state objects
 *
 * ## Reactive State
 * - `pageData`: Reactive object containing the current page information:
 *   - `article`: Reference to the current article object (null when no article is selected)
 *   - `content`: String containing the HTML content of the current page
 *
 * ## Function: usePageData
 * - Returns the reactive pageData object
 * - Can be called from any component to access or modify the current page state
 * - Changes to the pageData object will trigger reactivity in all components using it
 *
 * ## Return Value
 * - NsWowPageData: A reactive object containing article and content information
 *
 * ## Usage Example
 * ```typescript
 * const pageData = usePageData()
 *
 * // Read page data
 * console.log(pageData.content)
 *
 * // Update page data
 * pageData.article = articleObject
 * pageData.content = '<div>New content</div>'
 */
import { reactive } from 'vue'

const pageData = reactive<NsWowPageData>({
  article: null,
  content: '',
})
export default function usePageData() {
  return pageData
}