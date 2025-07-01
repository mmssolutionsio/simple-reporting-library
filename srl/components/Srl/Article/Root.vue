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
import { nextTick, ref, onMounted } from 'vue'
import VRuntimeTemplate from 'vue3-runtime-template'
import Autoload from '@/Autoload.ts'
import { useRoute } from 'vue-router'
import { useArticle, useArticles, useConfig, useRoot } from '#composables'
import { prepareHtmlContent } from '#utils'

const articleRoot = ref<HTMLDivElement | null>(null)
const config = useConfig()
const route = useRoute()
const articles = useArticles()
const content = ref<string>('')
const locale = route.params.locale as string
const article = useArticle()

if (article.value) {
  const file = `./html/${locale}/${article.value.name}.html`
  try {
    const req = await fetch(file)
    let text = await req.text()

    document.title = article.value.translatedTitle
    content.value = prepareHtmlContent(text)
  } catch (error) {
    console.error(`Failed to load article content from ${file}:`, error)
  }
}

onMounted(() => {
  nextTick(() => {
    Autoload.init(articleRoot.value)
    if (route.hash) {
      const target = document.querySelector(route.hash)
      if (target) {
        target.scrollIntoView({ behavior: 'instant', block: 'start' })
      }
    }
  })
})
</script>

<template>
  <article ref="articleRoot" class="srl-article-root">
    <VRuntimeTemplate :template="content" />
  </article>
</template>
