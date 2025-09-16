<script setup lang="ts">
import { onMounted, onUpdated, ref, watch } from 'vue'

const props = defineProps<{
  accordion: {
    id: string;
    state: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
  };
}>()

const rootEl = ref<HTMLDivElement>()
const focusElements = ref<HTMLElement[]>()

watch(
  props,
  to => {
    to.accordion.state ? setFocus() : unsetFocus()
  }
)

function getFocusElements() {
  const container = rootEl.value
  const elements = container?.querySelectorAll<HTMLElement>(
    'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
  )
  return Array.from(elements || []).filter(el => {
    const hiddenParent = el.closest('[hidden]')
    return !hiddenParent || hiddenParent === container
  })
}

function unsetFocus() {
  if (focusElements.value?.length) {
    focusElements.value.forEach(el => {
      el.tabIndex = -1
    })
  }
}

function setFocus() {
  if (focusElements.value?.length) {
    focusElements.value.forEach(el => {
      el.tabIndex = 0
    })
  }
}

onMounted(() => {
  focusElements.value = getFocusElements()
  if (!props.accordion.state) {
    unsetFocus()
  }
})
</script>

<template>
<div ref="rootEl" :id="props.accordion.id" :hidden="!props.accordion.state">
  <slot/>
</div>
</template>