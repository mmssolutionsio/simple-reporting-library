<script lang="ts" setup>
import ScrollToTop from '@/components/ScrollToTop.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import useConfig from '@/composables/config'
import { ArrayToString } from '@/utils/variables'

const config = await useConfig()
const route = useRoute()

const locale = computed<string>(() => {
  return ArrayToString(route.params.locale)
})

const articles = computed<NsWowArticle[]>(() => {
  const a = config.value.articles[locale.value]
  const res = []
  if (a) {
    for (let i = 0; i < a.length; i++) {
      if (a[i].originalLanguageOfArticle) {
        res.push(a[i])
      }
    }
  }
  return res
})

const activeArticle = computed<number>(() => {
  return articles.value.findIndex((i) => i.slug === ArrayToString(route.params.slug))
})

const nextRoute = computed(() => {
  if (activeArticle.value === -1) {
    return null
  }
  let nextIndex: number = activeArticle.value + 1
  if (nextIndex >= articles.value.length) {
    nextIndex = 0
  }
  return {
    params: {
      locale: locale.value,
      slug: articles.value[nextIndex].slug.split('/')
    }
  }
})

const prevRoute = computed(() => {
  if (activeArticle.value === -1) {
    return null
  }
  let prevIndex: number = activeArticle.value - 1
  if (prevIndex < 0) {
    prevIndex = articles.value.length - 1
  }
  return {
    params: {
      locale: locale.value,
      slug: articles.value[prevIndex].slug.split('/')
    }
  }
})
</script>
<template>
  <div class="srl-nav-holder">
    <router-link
      v-if="prevRoute"
      :to="prevRoute"
      class="srl-nav-holder__nav-btn srl-bg-primary srl-color-light srl-typo-headline3"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-chevron-left left"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
        />
      </svg>
      {{ $t('page.prev') }}
    </router-link>
    <ScrollToTop />
    <router-link
      v-if="nextRoute"
      :to="nextRoute"
      class="srl-nav-holder__nav-btn srl-bg-primary srl-color-light srl-typo-headline3"
    >
      {{ $t('page.next') }}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-chevron-right right"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
        />
      </svg>
    </router-link>
  </div>
</template>

<style scoped lang="scss">
@use 'nswow';

.srl-nav-holder {
  display: flex;
  width: 100%;
  justify-content: space-between;
  position: sticky;
  bottom: 0;
  margin-bottom: nswow.system-size-unit(10);

  &__nav-btn {
    display: flex;
    cursor: pointer;
    align-items: center;
    padding: nswow.system-size-unit(10) nswow.system-size-unit(15);

    svg {
      transition: all 200ms ease;

      &.left {
        margin-right: nswow.system-size-unit(10);
      }

      &.right {
        margin-left: nswow.system-size-unit(10);
      }
    }
  }

  @include nswow.grid-media(print) {
    display: none;
  }
}
</style>
