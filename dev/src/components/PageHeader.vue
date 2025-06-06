<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue';
import usePageData from '@multivisio/nswow/src/composables/pageData.ts';
import useConfig from '@multivisio/nswow/src/composables/config.ts';

const { locale } = useI18n()

const config = await useConfig()
const pageData = await usePageData();

const languages = computed<NsWowNavigationItem[]>(() => {
  const uuid = pageData.article?.uuid
  const res: NsWowNavigationItem = []
  if (uuid) {
    for (const locale of config.value.settings.languages) {
      const slug = config.value.articles[locale].find((article) => article.uuid === uuid)?.slug || ''
      res.push({
        label: locale,
        href: `/${locale}/${slug}`,
      })
    }
  }
  return res
})


</script>

<template>
  <header id="srl-page__header" class="srl-header" tabindex="-1">
    <div class="srl-header__container">
        <router-link :to="`/${locale}`" class="srl-logo">
          <img src="@/assets/images/mms-logo-white.svg" alt="MMS Solutions"/>
        </router-link>
    </div>
    <nav class="srl-language-switch srl-py-medium">
      <SrlMenu class="srl-gap-medium" name="language-switch" :menu="languages"/>
    </nav>
  </header>
</template>

<style lang="scss">
@use 'nswow';

.srl-header {
  background-color: nswow.colors-primary();
  display: flex;
  justify-content: center;

  &__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: var(--srl-container-max-width);
    padding-inline: var(--srl-container-padding);
  }
}

.srl-logo {
  display: block;
  width: 300px;
}

.srl-language-switch {
  ul {
    list-style: none;
    display: flex;
    padding: 0;
    margin: 0;
  }
  a {
    color: nswow.colors-light();
    text-decoration: none;
    text-transform: uppercase;
  }
}
</style>
