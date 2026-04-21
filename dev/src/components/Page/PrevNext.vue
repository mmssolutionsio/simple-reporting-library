<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

const headerThreshold = ref<number>(500)

function readHeaderHeight() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--srl-header-height')?.trim()
  if (!raw) {
    headerThreshold.value = 500
    return
  }

  // parse numeric part
  let value = parseFloat(raw)
  if (isNaN(value)) {
    headerThreshold.value = 500
    return
  }

  // handle rem unit (e.g. "2rem")
  if (raw.endsWith('rem')) {
    const rootFs = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    value = value * rootFs
  }

  headerThreshold.value = Math.round(value)
}

onMounted(() => {
  readHeaderHeight()
  window.addEventListener('resize', readHeaderHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', readHeaderHeight)
})
// --- END NEW ---

function prevNextHelper(item: NsWowNavigationItem, label: string = '', depth: number = 0) {
  if (item.href && isRouterPath(item.href)) {
    const url = item.href
    const title = label.length > 0 ? `${item.label}` : item.label
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
  window.scrollTo({ top: 0, behavior: 'smooth' })

  const checkScroll = () => {
    if (window.scrollY === 0) {
      const main = document.querySelector('#srl-page-main') as HTMLElement;
      main?.focus()
    } else {
      requestAnimationFrame(checkScroll)
    }
  }

  requestAnimationFrame(checkScroll)
}
</script>
<template>
  <div>
    <slot />
    <div class="srl-grid srl-wide-width srl-to-top">
      <div class="srl-grid__inner srl-to-top__inner">
        <ButtonDefault class="srl-to-top__button" :hidden="scrollY < 500" :label="$t('toTop')" icon="arrow-up" :callback="toTop" />
      </div>
    </div>
    <div class="srl-grid srl-wide-width srl-prev-next">
      <div class="srl-grid__inner srl-prev-next__inner">
        <div class="srl-prev-next__prev">
          <router-link
            v-if="prevItem"
            class="srl-page-prev__link"
            :to="prevItem.url"
            :title="prevItem.title"
          >
            <div class="srl-page-prev__icon srl-page-prev__icon--prev srl-button srl-button--icon">
              <i class="srl-icon-arrow-left" />
            </div>
            <div class="srl-page-prev__text">
              <span class="srl-page-prev__title" v-text="prevItem.title" />
            </div>
          </router-link>
        </div>
        <div class="srl-prev-next__next">
          <router-link
            v-if="nextItem"
            class="srl-page-prev__link"
            :to="nextItem.url"
            :title="nextItem.title"
          >
            <div class="srl-page-prev__text">
              <span class="srl-page-prev__title" v-text="nextItem.title" />
            </div>
            <div class="srl-page-prev__icon srl-page-prev__icon--prev srl-button srl-button--icon">
              <i class="srl-icon-arrow-right" />
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use 'srl';

.srl-prev-next {
  @include srl.spacer-margin-top(400);
}

.srl-prev-next__inner {
  display: grid;
  grid-template-columns: subgrid;
}

.srl-to-top {
  position: sticky;
  bottom: var(--srl-spacer-400);
  margin-top: var(--srl-spacer-1600);
  margin-bottom: var(--srl-spacer-400);
  display: flex;
  justify-content: flex-end;
  z-index: 3;
  pointer-events: none;
  @include srl.grid-col(4);
  @include srl.grid-col(4, phone-ls);
  @include srl.grid-col(8, tablet-pt);
  @include srl.grid-col(8, tablet-ls);
  @include srl.grid-col(12, desktop);
  @include srl.grid-col(12, desktop-large);
}

.srl-to-top__button {
  pointer-events: all;
  &:not([hidden]) {
    display: flex;
  }

  &[hidden] {
    pointer-events: none;
    opacity: 0;
  }
}

.srl-prev-next__prev,
.srl-prev-next__next {
  @include srl.grid-col(4);
}

.srl-prev-next__next {
  @include srl.grid-offset(8, tablet-ls);
  @include srl.grid-offset(8, desktop);
  @include srl.grid-offset(8, desktop-large);
}

.srl-page-prev__link {
  @extend %srl-button__switch;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @include srl.spacer-gap(200);
  @include srl.typography-paragraph();
  text-decoration: none;
  color: srl.colors-black-1000();
  transition: color 0.3s ease;
  @include srl.spacer-padding-top(400);
  @include srl.spacer-padding-bottom(400);
  border-top: 1px solid srl.colors-grey-200();

  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0s;
  }
}

.srl-page-prev__text {
  width: calc(100% - srl.system-size-unit(48) - srl.spacer-get(200));
}
</style>
