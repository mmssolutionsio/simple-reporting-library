<script setup lang="ts">
import useConfig from '@/composables/config'
import { type LocationQuery, useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { ArrayToString } from '@/utils/variables'

type langRoute = {
  params: {
    locale: string
    slug?: string | string[]
  }
  query?: LocationQuery
}
type langItem = {
  label: string
  active: boolean
  route: langRoute
}

const config = await useConfig()
const route = useRoute()

const languageItems = ref<langItem[]>([])

const locale = computed<string>(() => {
  return ArrayToString(route.params.locale)
})

const articles = computed<NsWowArticle[]>(() => {
  return config.value.articles[locale.value] ?? []
})

async function makeLanguageSwitch() {
  const languages = []
  for (let i = 0; i < config.value.settings.languages.length; i++) {
    const lang = config.value.settings.languages[i]
    const routeParams = route.params
    const linkRoute: langRoute = {
      params: {
        locale: lang
      }
    }
    if (routeParams.slug) {
      const slug = ArrayToString(routeParams.slug)
      const currentArticle = articles.value.find((a) => {
        return a.slug === slug
      })
      if (currentArticle) {
        const langArticle = config.value.articles[lang].find((a) => {
          return a.uuid === currentArticle.uuid
        })

        if (langArticle) {
          linkRoute.params.slug = langArticle.slug.split('/')
        }
      }
    }

    if (route.query) {
      linkRoute.query = route.query
    }

    languages.push({
      label: lang,
      active: lang === routeParams.locale,
      route: linkRoute
    })
  }
  languageItems.value = languages
}

watch(route, makeLanguageSwitch)
</script>

<template>
  <div class="srl-language-switch">
    <div v-for="link in languageItems" :key="link.label">
      <router-link class="srl-color-light" :to="link.route" :class="{ active: link.active }">
        {{ link.label.toUpperCase() }}
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'nswow';
.srl-language-switch {
  display: flex;
  justify-content: flex-end;
  gap: nswow.system-size-unit(5);

  a {
    background: transparent;
    border: none;
    cursor: pointer;
    outline: none;
    text-decoration: none;
  }
}
</style>
