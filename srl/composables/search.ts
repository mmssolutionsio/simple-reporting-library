/**
 * `search.ts`
 *
 * This Vue 3 composable provides search functionality across localized article content.
 * It builds a search index by extracting text from HTML content of articles and
 * implements a singleton pattern to ensure efficient data loading.
 *
 * ## Imports
 * - `computed`, `ref`: Vue reactivity utilities for state management
 * - `useConfig`: Composable for accessing application configuration
 * - `useArticles`: Composable for accessing localized article data
 * - `node-html-parser`: Library for HTML parsing and manipulation
 *
 * ## Variables
 * - `storage`: Reference object storing search data for all languages
 * - `computedStorage`: Singleton computed reference for current locale's search data
 *
 * ## Helper Functions
 * - `findByTag()`: Recursively finds HTML elements with specified tag names
 * - `makeWords()`: Extracts and normalizes text content from specific HTML tags
 *   for search indexing (h1, h2, h3, p elements)
 *
 * ## Function: useSearch
 * - Asynchronous function that builds and returns a search index
 * - Loads article HTML content on first call for the current locale
 * - Processes HTML to extract searchable text
 * - Builds an array of search items with article metadata and content
 * - Returns a computed reference that always reflects the current locale
 *
 * ## Return Value
 * - ComputedRef<NsWowSearchList[]>: A computed reference to an array of search items
 *   for the current locale
 *
 * ## Usage Example
 * ```typescript
 * const searchIndex = await useSearch()
 * console.log(searchIndex.value) // Array of search items for the current locale
 */
import { computed, type ComputedRef, ref } from 'vue';
import { HTMLElement, parse as parseHtml } from 'node-html-parser';
import { useConfig, useArticles } from '#composables';

const storage = ref<{
  [locale: string]: NsWowSearchList[];
}>();
let computedStorage: ComputedRef<NsWowSearchList[]>;

function findByTag(
  node: HTMLElement,
  tagName: string,
  tagsScope: HTMLElement[] = [],
) {
  if (!node.querySelectorAll) return tagsScope;
  const nodes: HTMLElement[] = node.querySelectorAll(tagName);
  tagsScope.push(...nodes);
  if (node.closest(tagName) == node) {
    tagsScope.push(node);
  }
  return tagsScope;
}

function makeWords(html: string) {
  const tagsToSearch = ['h1,h2,h3,p'];
  const rootObject = parseHtml(html);
  return tagsToSearch
    .flatMap((tag) => findByTag(rootObject, tag))
    .map((el) => el.innerText)
    .join(' ')
    .replace(/\s{2,}/g, ' ');
}

export default async function useSearch(): ComputedRef<NsWowSearchList[]> {
  const config = useConfig();
  if (!storage.value || !storage.value[config.value.locale]) {
    !storage.value ? (storage.value = {}) : null;
    storage.value[config.value.locale] = [];

    const articles = useArticles();

    for (const article of articles.value.filter(
      (item) => !item.ignoreInSearch,
    )) {
      const file = `./html/${config.value.locale}/${article.name}.html`;
      try {
        const response = await fetch(file);
        const htmlContent = await response.text();

        storage.value[config.value.locale].push({
          article: article,
          href: `/${config.value.locale}/${article.slug}`,
          words: makeWords(htmlContent),
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  if (!computedStorage) {
    computedStorage = computed<NsWowSearchList[]>(() => {
      if (!storage.value || !storage.value[config.value.locale]) {
        return [];
      }
      return storage.value[config.value.locale];
    });
  }

  return computedStorage;
}
