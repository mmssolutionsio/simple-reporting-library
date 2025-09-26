/**
 * `viewPort.ts`
 *
 * This Vue 3 composable provides responsive viewport detection based on configured breakpoints.
 * It creates a reactive reference to the current viewport size category and updates automatically
 * when the window is resized.
 *
 * ## Imports
 * - `grid` from configuration: Contains breakpoint definitions
 * - `computed`, `ref`: Vue reactivity utilities
 *
 * ## Types
 * - `Breakpoints`: Type definition for breakpoint configuration (key-value pairs)
 * - `ViewPorts`: Type definition for the returned viewport information object
 *
 * ## Reactive State
 * - `innerWidth`: Ref tracking the current window width
 * - `viewPorts`: Computed value that determines the current viewport category
 *   based on the window width and configured breakpoints
 *
 * ## Event Handling
 * - Adds a window resize event listener to update the innerWidth ref when the window size changes
 *
 * ## Function: useViewPort
 * - Returns a computed object containing:
 *   - `breakPoints`: The configured breakpoint values
 *   - `innerWidth`: Current window width
 *   - `viewPort`: Current viewport category name (or null if no matching breakpoint)
 *
 * ## Return Value
 * - ComputedRef<ViewPorts>: A computed reference to the viewport information
 *
 * ## Usage Example
 * ```typescript
 * const viewport = useViewPort()
 * console.log(viewport.value.viewPort) // Current viewport category (e.g., "sm", "md", "lg")
 * console.log(viewport.value.innerWidth) // Current window width in pixels
 */
import { grid } from '~/srl.config.json';
import { computed, ref, type ComputedRef } from 'vue';

type Breakpoints = {
  [key: string]: number;
};

type ViewPorts = {
  breakPoints: Breakpoints;
  innerWidth: number;
  viewPort: string | null;
};

const { breakpoints } = grid;
const bp = breakpoints as Breakpoints;
const innerWidth = ref<number>(window.innerWidth);

const viewPorts = computed<ViewPorts>(() => {
  const res: ViewPorts = {
    breakPoints: bp,
    innerWidth: window.innerWidth,
    viewPort: null,
  };

  for (const key in bp) {
    if (bp[key] <= innerWidth.value) {
      res.viewPort = key;
    } else {
      break;
    }
  }
  return res;
});

window.addEventListener('resize', () => {
  innerWidth.value = window.innerWidth;
});

export default function useViewPort(): ComputedRef<ViewPorts> {
  return viewPorts;
}
