<script setup lang="ts">
import { computed, ref, useId } from 'vue'

const rootEl = ref<HTMLElement | null>(null)
const id = ref(useId())
const state = ref(false)
function toggle() {
  state.value ?
    close() :
    open()
}

function open() {
  state.value = true
  rootEl.value.querySelector<HTMLDivElement>(`#${id.value}`)?.focus()
}

function close() {
  state.value = false
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

</script>

<template>
  <div ref="rootEl">
    <slot :accordion="accordion"/>
  </div>
</template>