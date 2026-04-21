<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId } from 'vue'
import { useRoute } from 'vue-router'
import { isAccordionAnchored, setAccordionAnchored } from '#utils'

const rootEl = ref<HTMLElement | null>(null)
const id = ref(useId())
const state = ref(false)
const route = useRoute()
function toggle() {
  state.value ?
      close() :
      open()
}

function open() {
  state.value = true
  const r = rootEl.value as HTMLElement
  r?.querySelector<HTMLDivElement>(`#${id.value}`)?.focus()
}

function close() {
  state.value = false
  const r = rootEl.value as HTMLElement
  r?.querySelector<HTMLDivElement>(`[aria-controls="${id.value}"]`)?.focus()
}

const accordion = computed(() => {
  const propId = id.value
  const propState = state.value
  return {
    id: propId,
    state: propState,
    toggle,
    open,
    close,
  }
})

onMounted(() => {
  if (route.hash) {
    const r = rootEl.value as HTMLElement
    if (r.id && `#${r.id}` === route.hash) {
      open()
      isAccordionAnchored() || setAccordionAnchored(true)
    } else {
      const targetEl = r?.querySelector<HTMLElement>(route.hash)
      if (targetEl) {
        open()
        if (!isAccordionAnchored()) {
          setAccordionAnchored(true)
          nextTick(() => {
            setTimeout(() => {
              r.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              })
            }, 200)
          })
        }
      }
    }
  }
})

</script>

<template>
  <div ref="rootEl" tabindex="-1">
    <slot :accordion="accordion"/>
  </div>
</template>