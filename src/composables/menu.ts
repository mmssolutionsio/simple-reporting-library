/**
 * `menu.ts`
 *
 * This Vue 3 composable provides navigation menu functionality with localization support.
 * It transforms menu configuration data into structured navigation items that include
 * proper routing information, active state tracking, and nested hierarchies.
 *
 * ## Imports
 * - `useConfig`: Composable for accessing application configuration
 * - `computed`, `Ref`, `WritableComputedRef`: Vue reactivity utilities
 * - `useI18n`: Vue-i18n composable for localization
 * - `useRoute`: Vue Router composable for route information
 *
 * ## Functions
 * - `buildNav()`: Helper function that recursively transforms menu items (NsWowMenu) into
 *   navigation items (NsWowNavigationItem) with proper routing and active state
 *   - Handles internal (article) links with locale-based paths
 *   - Handles external links
 *   - Processes nested submenu structures
 *   - Sets active state based on current route
 *
 * - `useMenu(name)`: Main composable function that returns a computed array of navigation items
 *   - Loads the menu with the specified name for the current locale
 *   - Transforms menu items into navigation items with proper routing
 *   - Handles errors gracefully and returns an empty array if the menu doesn't exist
 *
 * ## Parameters
 * - `name`: String - The identifier of the menu to retrieve
 *
 * ## Return Value
 * - ComputedRef<NsWowNavigationItem[]>: A computed reference to an array of
 *   navigation items in the current locale
 *
 * ## Usage Example
 * ```typescript
 * const mainNavigation = await useMenu('menuMain')
 * console.log(mainNavigation.value) // Array of navigation items for the main menu
 */
import { computed, type Ref, type WritableComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { type RouteLocationNormalizedLoadedGeneric, useRoute } from 'vue-router'
import useConfig from './config'

function buildNav(item: NsWowMenu, route: RouteLocationNormalizedLoadedGeneric, locale: WritableComputedRef<string>, config: Ref<NsWowConfig>): NsWowNavigationItem {

  const res: NsWowNavigationItem = {
    label: item.label,
    active: false
  }

  if (item.type === 'Article') {
    const page = config.value.articles[locale.value].find(i => i.uuid === item.page)
    if (page) {
      res.type = 'internal'
      res.href = `/${locale.value}/${page.slug}`
      res.active = route.path === res.href
    }
  } else if (item.url && item.type === 'ExternalLink') {
    if (item.url.startsWith('./')) {
      res.type = 'internal'
      res.href = item.url.substring(1)
      res.active = route.path === res.href
    } else {
      res.type = 'external'
      res.href = item.url
    }
  }

  if (item.submenuEntries) {
    res.children = [];
    item.submenuEntries?.forEach((subItem) => {
      const subMenu = buildNav(subItem, route, locale, config)
      if (subMenu.active) {
        res.active = true
      }
      res.children?.push(subMenu)
    })
  }

  return res
}

export default async function useMenu(name: string) {
  const { locale } = useI18n()
  const route = useRoute()
  const config = await useConfig()
  return computed<NsWowNavigationItem[]>(() => {
    try {
      return config.value.menus[locale.value][name].map((item) => buildNav(item, route, locale, config)).filter(Boolean)
    } catch (error) {
      console.error(error)
      return []
    }
  })
}