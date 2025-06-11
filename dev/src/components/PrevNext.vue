<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { isRouterPath } from '#utils'

const props = defineProps<{
  mainNavigation: NsWowNavigationItem[]
}>()

const route = useRoute()

type PrevNextNavigationItem = {
  title: string
  url: string
}

const prevNextNavigation = ref<PrevNextNavigationItem[]>([])

const scrollY = ref(window.scrollY)

window.addEventListener('scroll', () => {
  scrollY.value = window.scrollY
})
function prevNextHelper(item: NsWowNavigationItem, label: string = '', depth: number = 0) {
  if (item.href && isRouterPath(item.href)) {
    const url = item.href
    const title = label.length > 0 ? `${label}\n${item.label}` : item.label
    prevNextNavigation.value.push({ title, url })
  }

  if (item.children) {
    for (const child of item.children) {
      let nextLabel = ''
      if (depth !== 0 && item.label !== 'left' && item.label !== 'right') {
        nextLabel = item.label
      }
      prevNextHelper(child, nextLabel, depth + 1)
    }
  }
}

for (const item of props.mainNavigation) {
  prevNextHelper(item)
}

const currentIndex = computed<number | -1>(() => {
  return prevNextNavigation.value.findIndex((item) => item.url === route.path)
})

const prevItem = computed(() => {
  if (currentIndex.value === -1) {
    return null
  }
  return currentIndex.value > 0
    ? prevNextNavigation.value[currentIndex.value - 1]
    : prevNextNavigation.value[prevNextNavigation.value.length - 1]
})

const nextItem = computed(() => {
  if (currentIndex.value === -1) {
    return null
  }
  return currentIndex.value < prevNextNavigation.value.length - 1
    ? prevNextNavigation.value[currentIndex.value + 1]
    : prevNextNavigation.value[0]
})

function toTop() {
  window.scrollTo(0, 0)
  document.querySelector('#srl-page__main')?.focus()
}
</script>
<template>
  <div>
    <slot />
    <div class="srl-prev-next">
      <div class="srl-prev-next__wrap">
        <button class="srl-to-top" :hidden="scrollY < 500" type="button" @click="toTop">
          <img src="@/assets/images/toTop.svg" :alt="$t('toTop')" :title="$t('toTop')" />
        </button>
        <router-link
          v-if="prevItem"
          class="srl-page-prev"
          :to="prevItem.url"
          :title="prevItem.title"
        >
          <img src="@/assets/images/prev.svg" :alt="$t('pagePrev')" />
        </router-link>
        <router-link
          v-if="nextItem"
          class="srl-page-next"
          :to="nextItem.url"
          :title="nextItem.title"
        >
          <img src="@/assets/images/next.svg" :alt="$t('pageNext')" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use 'srl';

body:has(.srl-to-top) {
  .srl-article-root {
    padding-block-end: srl.system-size-unit(60) !important;
  }
}

.srl-prev-next {
  pointer-events: none;
  position: sticky;
  bottom: 0;
  z-index: 800;
  max-width: calc(var(--srl-container-max-width) + var(--srl-container-padding) * 2);
  padding-inline: var(--srl-container-padding);
  margin-inline: auto;
  padding-block-end: var(--srl-spacer-medium);
  height: calc(var(--srl-spacer-L) + srl.system-size-unit(44));

  &__wrap {
    display: flex;
    position: relative;
    justify-content: space-between;
    width: 100%;
  }
}

.srl-to-top {
  pointer-events: auto;
  width: srl.system-size-unit(44);
  height: srl.system-size-unit(44);
  position: absolute;
  top: srl.system-size-unit(-52);
  right: 0;
  margin: 0;
  padding: 0;
  border: 0;
  cursor: pointer;
  transition: all ease-out 0.3s;
  opacity: 1;

  &:not([hidden]) {
    display: block;
  }

  &[hidden] {
    pointer-events: none;
    opacity: 0;
  }

  img {
    display: block;
  }
}

.srl-page-prev,
.srl-page-next {
  pointer-events: auto;
  width: srl.system-size-unit(44);
  height: srl.system-size-unit(44);
  display: block;
  img {
    display: block;
  }
}
</style>
