<script setup lang="ts">
/**
 * `Data.vue`
 *
 * This Vue 3 component is responsible for loading and preparing page content
 * based on the current route. It acts as a data provider that fetches HTML content,
 * processes it for proper display, and maintains the global page data state.
 *
 * ## Imports
 * - Vue Router utilities for accessing current route information
 * - Vue I18n for localization support
 * - Vue reactivity utilities for state management
 * - Application composables for configuration and page data management
 *
 * ## Reactive State
 * - `styles`: Array of extracted CSS styles from HTML content
 * - `htmlOutput`: String containing processed HTML style tags for rendering
 *
 * ## Key Function: preparePageData
 * - Asynchronously loads the appropriate article based on current route
 * - Fetches HTML content from locale-specific files
 * - Transforms relative links to proper localized routes
 * - Extracts embedded CSS styles from HTML content
 * - Updates the global page data store with article information and content
 * - Sets document title based on the article's translated title
 *
 * ## Route Watching
 * - Re-processes page data when the route changes
 * - Handles hash fragment scrolling after content updates
 *
 * ## Template
 * - Renders the extracted CSS styles
 *
 * ## Usage Context
 * This component is loaded as part of the application startup process
 * in the main App component and provides the content that will be
 * displayed to the user.
 */
import { type RouteLocationNormalizedLoadedGeneric, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { nextTick, ref, type Ref, watch, type WritableComputedRef } from 'vue'
import useConfig from '../../../composables/config';
import usePageData from '../../../composables/pageData';

const route = useRoute()
const { locale } = useI18n()
const config = await useConfig()
const pageData = usePageData()
const styles = ref<string[]>([])
const htmlOutput = ref<string>('')

async function preparePageData(route: RouteLocationNormalizedLoadedGeneric, locale: WritableComputedRef<string>, config: Ref<NsWowConfig>) {

  let article: NsWowArticle | null = null
  let content = ''

  if ( route.name || route.params.slug ) {
    const page =
      config.value.articles[locale.value] ?
        route.name === 'search' ? null :
          route.name === 'home' ?
            config.value.articles[locale.value].find((page) => page.index) :
            route.params.slug ? config.value.articles[locale.value].find((page) => page.slug === route.params.slug[0]):null:null

    if (page) {
      article = page
      try {
        const file = `./html/${locale.value}/${page.name}.html`
        const response = await fetch(file)
        if (response.ok) {
          if (document) {
            document.title = page.translatedTitle
          }
          const c = await response.text()
          content = c.replaceAll('../', `./`)

          const hrefs = [...content.matchAll(/href="([^"]*)"/g)].map(match => match[1])
          hrefs.forEach((link) => {
            const arrLink = link.split('#')
            const article = config.value.articles[locale.value].find((page) => page.uuid === arrLink[0])
            if (article) {
              const href = `./${locale.value}/${article.slug}` + (arrLink[1] ? `#${arrLink[1]}` : '')
              content = content.replaceAll(`href="${link}"`, `href="${href}"`)
            }
          })

        } else {
          console.log(`"${file}" could not be loaded.`)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  content = content.replaceAll('/de/home', `/de`)

  content = content.replace(/<style[^>]*>([\s\S]*?)<\/style>/ig, (match, p1) => {
    styles.value.includes(p1) || styles.value.push(p1)
    return ''
  })

  if (styles.value.length) {
    htmlOutput.value = `<style>${styles.value.join('')}</style>`
  }

  pageData.article = article
  pageData.content = content
  pageData.time = new Date().getTime()
}

await preparePageData(route, locale, config)

watch(route, async () => {
  await preparePageData(route, locale, config)
  await nextTick(() => {
    if (route.hash) {
      const target = document.querySelector(route.hash);
      if (target) {
        target.scrollIntoView();
      }
    }
  })
})

</script>

<template>
  <div v-html="htmlOutput"/>
</template>
