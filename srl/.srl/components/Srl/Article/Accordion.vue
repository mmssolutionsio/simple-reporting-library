<script setup lang="ts">
import {computed, onMounted, ref, useId} from 'vue'

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

const id = useId()
const rootEl = ref<HTMLDivElement>()
const toggle = ref<HTMLButtonElement>()
const content = ref<HTMLDivElement>()
const wrapper = ref<HTMLDivElement>()
const transition = computed<string>(() => {
  return props.duration + 'ms'
})

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
      const isExpanded = toggle.value?.getAttribute('aria-expanded') === 'true'
      toggle.value?.setAttribute('aria-expanded', String(!isExpanded))
      if (!isExpanded) {
        wrapper.value?.removeAttribute('hidden')
        content.value?.classList.add(props.openClass)
        content.value.focus()
      } else {
        content.value?.classList.remove(props.openClass)
        setTimeout(() => {
          wrapper.value?.setAttribute('hidden', 'true')
        }, props.duration)
      }
    })
  }
})
</script>

<template>
  <div class="srl-article-accordion" ref="rootEl">
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