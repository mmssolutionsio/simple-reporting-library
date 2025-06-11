/**
 * `src/composables/menu.ts`
 *
 * A Vue 3 composable that provides functionality for processing menu structures
 * and using them in navigation components.
 *
 * ## Functionality
 * - Converts menu objects from configuration into navigation elements
 * - Automatically detects active menu items based on the current route
 * - Supports different menu types: Articles, internal and external links
 * - Handles recursively nested submenus
 * - Implements caching for already created menus
 *
 * ## Data Types
 * - `NsWowMenu`: Input type for menu elements from configuration
 *   - Contains `label`, `type`, `page`, `url`, `submenuEntries`
 * - `NsWowNavigationItem`: Output type for navigation elements
 *   - Contains `label`, `type`, `href`, `active`, `children`
 *
 * ## Main Functions
 * - `buildNav()`: Internal function to convert menu items into navigation elements
 * - `useMenu(name)`: Main function that returns a computed menu based on its name
 *   - Parameter: `name` - String, the name of the menu in the configuration
 *   - Returns: Computed reference to an array of navigation elements
 *
 * ## Usage
 * const menu = useMenu('mainMenu')
 *
 */
import { computed, type Ref, type WritableComputedRef } from 'vue';
import {
  type RouteLocationNormalizedLoadedGeneric,
  useRoute,
} from 'vue-router';
import { isRouterPath } from '../utils/uri';
import useConfig from './config';

const config = useConfig();
const menus = {};

function buildNav(
  item: NsWowMenu,
  route: RouteLocationNormalizedLoadedGeneric,
): NsWowNavigationItem {
  const res: NsWowNavigationItem = {
    label: item.label,
    active: false,
  };

  if (item.type === 'Article') {
    const page = config.value.articles[config.value.locale].find(
      (i) => i.uuid === item.page,
    );
    if (page) {
      res.href = `/${config.value.locale}/${page.slug}`;
      res.active = route.path === res.href;
    }
  } else if (item.url && item.type === 'ExternalLink') {
    if (isRouterPath(item.url)) {
      res.href = item.url.startsWith('.') ? item.url.substring(1) : item.url;
      res.active = route.path === res.href;
    } else {
      res.href = item.url;
    }
  }

  if (item.submenuEntries) {
    res.children = [];
    item.submenuEntries?.forEach((subItem) => {
      const subMenu = buildNav(subItem, route);
      if (subMenu.active) {
        res.active = true;
      }
      res.children?.push(subMenu);
    });
  }

  return res;
}

export default function useMenu(name: string) {
  if (menus[name]) {
    return menus[name];
  } else {
    try {
      const route = useRoute();
      menus[name] = computed<NsWowNavigationItem[]>(() => {
        return config.value.menus[config.value.locale][name].map((item) => {
          return buildNav(item, route);
        });
      });

      return menus[name];
    } catch (e) {
      console.error(e);
      return computed<NsWowNavigationItem[]>(() => []);
    }
  }
}
