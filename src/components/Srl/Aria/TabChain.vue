<script setup lang="ts">
/**
 * `SrlAriaTabChain.vue`
 *
 * This Vue 3 component implements a closed tab navigation chain.
 * It monitors focusable elements within the container and ensures that
 * tab navigation works as a closed cycle: tabbing on the last element returns
 * to the first element, and shift+tab on the first element jumps to the last.
 *
 * ## Reactive Variables
 * - `availableTabs`: Array of all focusable elements in the container
 * - `rootElement`: Reference to the root <div> element of the component
 * - `firstElement`: Reference to the first focusable element
 * - `lastElement`: Reference to the last focusable element
 *
 * ## Methods
 * - `registerTabs()`: Finds all focusable elements in the container and stores references
 * - `next(event)`: Handler for Tab key, jumps from last to first element
 * - `prev(event)`: Handler for Shift+Tab key, jumps from first to last element
 *
 * ## Lifecycle Hooks
 * - On mounting and after updates, `registerTabs()` is called to capture focusable elements
 *
 * ## Event Handlers
 * - `@keydown.tab.stop`: Intercepts Tab key and calls `next()`
 * - `@keydown.shift.tab.stop.prevent`: Intercepts Shift+Tab and calls `prev()`
 *
 * ## Usage Example
 * ```vue
 * <SrlAriaTabChain>
 *   <button>First Button</button>
 *   <input type="text" />
 *   <button>Last Button</button>
 * </SrlAriaTabChain>
 */
import { ref, nextTick, onMounted, onUpdated } from 'vue';

const availableTabs = ref<Array<HTMLElement>>([])
const rootElement = ref<HTMLDivElement>();
const firstElement = ref<HTMLElement>();
const lastElement = ref<HTMLElement>();

function registerTabs(): void {
  availableTabs.value = Array.from(
    rootElement.value.querySelectorAll<HTMLElement>(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  )
  firstElement.value = availableTabs.value[0];
  lastElement.value = availableTabs.value.at(-1);
}

onMounted(() => {
  nextTick(registerTabs)
});

onUpdated(() => {
  nextTick(registerTabs)
})

function next(event) {
  if (availableTabs.value.length === 0) {
    return;
  }

  const focusedElement = document.activeElement as HTMLElement;

  if (focusedElement === lastElement.value) {
    event.preventDefault()
    firstElement.value.focus()
  }
}

function prev(event) {
  if (availableTabs.value.length === 0) {
    return;
  }

  const currentIndex = availableTabs.value.indexOf(event.target);

  if (currentIndex === -1) {
    firstElement.value.focus()
  } else if (currentIndex === 0){
    lastElement.value.focus();
  } else {
    availableTabs.value[currentIndex - 1].focus();
  }
}
</script>

<template>
  <div
    ref="rootElement"
    tabindex="-1"
    @keydown.tab.stop="next"
    @keydown.shift.tab.stop.prevent="prev"
  >
    <slot/>
  </div>
</template>