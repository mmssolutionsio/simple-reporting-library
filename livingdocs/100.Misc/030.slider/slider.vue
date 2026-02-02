<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import SvgNext from '~/livingdocs/100.Misc/030.slider/components/next.vue'
import SvgPrev from '~/livingdocs/100.Misc/030.slider/components/prev.vue'
import { useSrlConfig } from '#composables'
import type SwiperClass from 'swiper/types/swiper-class'

const srlConfig = useSrlConfig();

const props = withDefaults(defineProps<{
  loop?: boolean
  navigation?: boolean
  pagination?: boolean
}>(), {
  loop: false,
  navigation: true,
  pagination: false,
})

const SwiperEl = ref<SwiperClass>()

const modules = computed(() => [
  ...(props.navigation ? [Navigation] : []),
  ...(props.pagination ? [Pagination] : [])
])

function mapGap(breakpoint: string): number {
  return srlConfig.value.grid.gutter[breakpoint]['column-gap'] ??
    srlConfig.value.grid.gutter[breakpoint]['gap'] ?? 0
}

const breakpoints = computed(() => ({
  [srlConfig.value.grid.breakpoints['phone-ls']]: {
    slidesPerView: 1,
    spaceBetween: mapGap('phone-ls'),
  },
  [srlConfig.value.grid.breakpoints['tablet-pt']]: {
    slidesPerView: 1,
    spaceBetween: mapGap('tablet-pt'),
  },
  [srlConfig.value.grid.breakpoints['tablet-ls']]: {
    slidesPerView: 2,
    spaceBetween: mapGap('tablet-ls'),
  },
  [srlConfig.value.grid.breakpoints['desktop']]: {
    slidesPerView: 3,
    spaceBetween: mapGap('desktop'),
  },
  [srlConfig.value.grid.breakpoints['desktop-large']]: {
    slidesPerView: 3,
    spaceBetween: mapGap('desktop-large'),
  },
}))

let resizeTimeout: ReturnType<typeof setTimeout>

function calculateHeight() {
  clearTimeout(resizeTimeout)
  if (SwiperEl.value?.slidesEl) {
    SwiperEl.value.slidesEl.style.height = 'auto'

    resizeTimeout = setTimeout(() => {
      if (SwiperEl.value?.slides?.length > 0) {
        let height = 0
        SwiperEl.value?.slides.forEach(slide => {
          const slideHeight = slide.offsetHeight
          if (slideHeight > height) {
            height = slideHeight
          }
        })
        SwiperEl.value?.slidesEl ? SwiperEl.value.slidesEl.style.height = `${height}px` : null
      }
    }, 100)
  }
}

function onSwiper(swiper) {
  SwiperEl.value = swiper
  calculateHeight()
}

onMounted(() => {
  window.addEventListener('resize', () => {
    calculateHeight()
  })
})

</script>

<template>
  <Swiper
    class="swiper"
    :modules="modules"
    :loop="props.loop"
    :navigation="props.navigation ? { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' } : false"
    :pagination="props.pagination ? { el: '.swiper-pagination', clickable: true } : false"
    :breakpoints="breakpoints"
    @swiper="onSwiper"
  >
    <slot/>
    <div v-if="props.pagination" class="swiper-pagination"></div>
    <div v-if="props.navigation" class="swiper-button-prev"><SvgPrev/></div>
    <div v-if="props.navigation" class="swiper-button-next"><SvgNext/></div>
  </Swiper>
</template>