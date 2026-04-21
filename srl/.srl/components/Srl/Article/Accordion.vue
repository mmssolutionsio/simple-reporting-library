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
const rootEl = ref<HTMLDivElement | null>(null)
const toggle = ref<HTMLButtonElement | null>(null)
const content = ref<HTMLDivElement | null>(null)
const wrapper = ref<HTMLDivElement | null>(null)
const transition = computed<string>(() => {
  return props.duration + 'ms'
})

function open() {
  const t = toggle.value as HTMLButtonElement
  const w = wrapper.value as HTMLDivElement
  const c = content.value as HTMLDivElement
  t.setAttribute('aria-expanded', 'true')
  w.removeAttribute('hidden')
  c.classList.add(props.openClass)
  c.focus()
}

function close() {
  const t = toggle.value as HTMLButtonElement
  const w = wrapper.value as HTMLDivElement
  const c = content.value as HTMLDivElement

  t.setAttribute('aria-expanded', 'false')
  c.classList.remove(props.openClass)
  setTimeout(() => {
    w.setAttribute('hidden', 'true')
  }, props.duration)
}

onMounted(() => {
  const r = rootEl.value as HTMLDivElement

  toggle.value = r.querySelector( props.toggleSelector ) || null
  content.value = r.querySelector( props.contentSelector ) || null
  wrapper.value = r.querySelector( props.wrapperSelector ) || null

  if (toggle.value && content.value && wrapper.value) {
    const t = toggle.value as HTMLButtonElement
    const w = wrapper.value as HTMLDivElement
    const c = content.value as HTMLDivElement

    w.setAttribute('hidden', 'true')
    c.id = id
    c.setAttribute('tabindex', '-1')
    t.setAttribute('aria-controls', id)
    t.setAttribute('aria-expanded', 'false')

    t.addEventListener('click', () => {
      t.getAttribute('aria-expanded') === 'true' ? close() : open()
    })

    if (route.hash) {
      if (r.id && r.id === route.hash) {
        open()
        isAccordionAnchored() || setAccordionAnchored(true)
      } else {
        const targetEl = r.querySelector<HTMLElement>(route.hash)
        if (targetEl) {
          open()
          if (!isAccordionAnchored()) {
            setAccordionAnchored(true)
            setTimeout(() => {
              r.scrollIntoView({
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