<script setup lang="ts">
/**
 * `SrlPageApp.vue`
 *
 * This Vue 3 component serves as the primary layout orchestrator for the application.
 * It coordinates the loading and rendering of main application components within
 * Suspense boundaries to handle asynchronous loading states.
 *
 * ## Imports
 * - `App`: Main application component
 * - `SrlPageData`: Component responsible for loading and preparing page content
 * - `SrlPageModal`: Modal dialog component for displaying dynamic content
 * - `ref`: Vue reactivity utility for creating mutable references
 *
 * ## Reactive State
 * - `modal`: Reference to the SrlPageModal component instance
 *
 * ## Methods
 * - `modalContent(html)`: Asynchronous method to set the content of the modal dialog
 *   - Delegates to the modal component's setContent method
 *   - Takes HTML string as input for display in the modal
 *
 * ## Exposed API
 * - The component exposes the modal reference and modalContent function
 *   for parent components to access and control the modal dialog
 *
 * ## Template Structure
 * - Uses three Suspense components to handle asynchronous loading:
 *   1. SrlPageData: Loads and prepares page content based on current route
 *   2. App: Main application component with primary UI elements
 *   3. SrlPageModal: Modal dialog component for overlay content
 *
 * ## Usage Context
 * This component acts as the structural foundation of the application,
 * managing the loading sequence of content and providing modal functionality
 * to other components in the application.
 */
import App from '@/App.vue';
import SrlPageModal from '@/Modal.vue';
import { ref, watch } from 'vue';

let styleElement = document.createElement('style');
document.head.appendChild(styleElement);

const modal = ref<typeof SrlPageModal>();
async function modalContent(html: string) {
  await modal.value?.setContent(html);
}

const styleContent = ref<string[]>([]);
function addCssStyles(styles: string) {
  styleContent.value.includes(styles) || styleContent.value.push(styles);
}
watch(
  styleContent.value,
  (newStyles) => {
    styleElement.innerHTML = newStyles.join('');
  },
  { immediate: true },
);

defineExpose({
  modal,
  modalContent,
  addCssStyles,
});
</script>

<template>
  <suspense>
    <App />
  </suspense>
  <suspense>
    <SrlPageModal ref="modal" />
  </suspense>
</template>
