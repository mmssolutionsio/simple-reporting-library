<script setup lang="ts">
/**
 * `Root.vue`
 *
 * This Vue 3 component serves as the main container for rendering dynamic article content.
 * It uses VRuntimeTemplate to render HTML content from pageData and initializes automatic
 * loading functionality after content changes.
 *
 * ## Imports
 * - `nextTick`, `ref`, `watch`: Vue core functionality
 * - `VRuntimeTemplate`: Library for rendering dynamic templates at runtime
 * - `usePageData`: Composable that provides access to the current page data
 * - `Autoload`: Utility for initializing dynamic content
 *
 * ## Reactive Variables
 * - `pageData`: Data from the usePageData composable containing article content
 * - `articleRoot`: Reference to the root article element
 *
 * ## Watchers
 * - Watches for changes in `pageData` and runs Autoload.init on the article root element
 *   after the DOM has updated
 *
 * ## Template
 * - Renders an article element with the class "srl-article-root"
 * - Uses VRuntimeTemplate to dynamically render the HTML content from pageData.content
 *
 * ## Usage
 * This component is typically used as part of a page layout system to display
 * the main content of articles that may contain dynamic elements requiring initialization.
 */
import { nextTick, ref, watch } from 'vue'
import VRuntimeTemplate from "vue3-runtime-template"
import Autoload from '@/Autoload.ts'
import usePageData from '../../../composables/pageData.ts'

const pageData = usePageData()

const articleRoot = ref<HTMLDivElement>()

watch(
  pageData,
  async () => {
    nextTick(async () => {
      await Autoload.init(articleRoot.value)
    })
  }
)

</script>

<template>
  <article ref="articleRoot" class="srl-article-root">
    <VRuntimeTemplate :template="pageData.content" />
  </article>
</template>