<script setup lang="ts">
/**
 * `Autoload.vue`
 *
 * This Vue 3 component automatically initializes the `Autoload` functionality
 * on the root element when the component is mounted.
 *
 * ## Imports
 * - `Autoload`: A module imported from `@/Autoload.ts` that provides the `init` method.
 * - `onMounted`: A Vue lifecycle hook used to execute logic after the component is mounted.
 * - `ref`: A Vue function to create a reactive reference for the root element.
 *
 * ## Refs
 * - `rootElement`: A reactive reference to the root `<div>` element of the component.
 *
 * ## Lifecycle Hooks
 * - `onMounted`: Invokes the `Autoload.init` method with the `rootElement` when the component is mounted.
 *
 * ## Template
 * Renders a `<div>` element with a `ref` attribute set to `rootElement`. The component uses a `slot` to allow custom content to be passed into the `<div>`.
 *
 * ## Usage Example
 * ```vue
 * <SrlArticleAutoload>
 *   <p>Content to be autoloaded</p>
 * </SrlArticleAutoload>
 */
import Autoload from '@/Autoload.ts'
import { onMounted, ref } from 'vue'
const rootElement = ref<HTMLDivElement>()

onMounted(() => {
  !rootElement.value || Autoload.init(rootElement.value)
})
</script>

<template>
  <div ref="rootElement">
    <slot />
  </div>
</template>