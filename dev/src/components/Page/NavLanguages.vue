<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import Tr from '@/i18n/translation.ts'

import { useConfig, useArticle } from '#composables'

const { locale } = useI18n()

const config = useConfig()
const article = useArticle()

const languages = computed<NsWowNavigationItem[]>(() => {
  if (!article.value) {
    return []
  }
  const uuid = article.value.uuid
  const res: NsWowNavigationItem = []
  if (uuid) {
    for (const locale of config.value.settings.languages) {
      const slug = config.value.articles[locale].find((a) => a.uuid === uuid)?.slug || ''
      res.push({
        label: locale.toUpperCase(),
        href: article.value.index ? `/${locale}` : `/${locale}/${slug}`,
        callback: () => {
          Tr.switchLanguage(locale)
        }
      })
    }
  }
  return res
})
</script>

<template>
  <nav class="srl-language-switch srl-py-medium">
    <SrlMenu class="srl-gap-medium" name="language-switch" :menu="languages" />
  </nav>
</template>

<style lang="scss">
@use 'srl';

.srl-language-switch {
  ul {
    list-style: none;
    display: flex;
    padding: 0;
    margin: 0;
  }
  a {
    color: srl.colors-white-1000();
    text-decoration: none;
    text-transform: uppercase;
  }
}
</style>
