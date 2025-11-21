<script setup lang="ts">
import {computed, onMounted, ref, useId} from 'vue'
import { useRoute } from 'vue-router'
import { isAccordionAnchored, setAccordionAnchored } from '#utils'

const props = withDefaults(defineProps<{
  toggleSelector?: string
  contentSelector?: string
  wrapperSelector?: string
  openClass?: string
  duration?: number
}>(), {
  toggleSelector: '.srl-article-accordion__toggle',
  contentSelector: '.srl-article-accordion__content',
  wrapperSelector: '.srl-article-accordion__wrapper',
  openClass: 'open',
  duration: 300,
})

const route = useRoute()

const id = useId()
const rootEl = ref<HTMLDivElement>()
const toggle = ref<HTMLButtonElement>()
const content = ref<HTMLDivElement>()
const wrapper = ref<HTMLDivElement>()
const transition = computed<string>(() => {
  return props.duration + 'ms'
})

function open() {
  toggle.value?.setAttribute('aria-expanded', 'true')
  wrapper.value?.removeAttribute('hidden')
  content.value?.classList.add(props.openClass)
  content.value.focus()
}

function close() {
  toggle.value?.setAttribute('aria-expanded', 'false')
  content.value?.classList.remove(props.openClass)
  setTimeout(() => {
    wrapper.value?.setAttribute('hidden', 'true')
  }, props.duration)
}

onMounted(() => {
  toggle.value = rootEl.value?.querySelector( props.toggleSelector ) || undefined
  content.value = rootEl.value?.querySelector( props.contentSelector ) || undefined
  wrapper.value = rootEl.value?.querySelector( props.wrapperSelector ) || undefined

  if (toggle.value && content.value && wrapper.value) {
    wrapper.value.setAttribute('hidden', 'true')
    content.value.id = id
    content.value.setAttribute('tabindex', '-1')
    toggle.value.setAttribute('aria-controls', id)

    toggle.value.addEventListener('click', () => {
      toggle.value?.getAttribute('aria-expanded') === 'true' ? close() : open()
    })

    if (route.hash) {
      if (rootEl.value.id && rootEl.value.id === route.hash) {
        open()
        isAccordionAnchored() || setAccordionAnchored(true)
      } else {
        const targetEl = rootEl.value?.querySelector<HTMLElement>(route.hash)
        if (targetEl) {
          open()
          if (!isAccordionAnchored()) {
            setAccordionAnchored(true)
            setTimeout(() => {
              rootEl.value?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              })
            }, 200)
          }
        }
      }
    }
  }
})
</script>

<template>
  <div class="srl-article-accordion" ref="rootEl" tabindex="-1">
    <slot/>
  </div>
</template>

<style lang="scss">
.srl-article-accordion {
  &__content {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows v-bind(transition) ease-out;

    &.open {
      grid-template-rows: 1fr;
    }
  }
  &__wrapper {
    overflow: hidden;
  }
}
</style>