<script setup lang="ts">
const props = defineProps<{
  id: string
  open: boolean
  toggle: () => void
}>()
</script>

<template>
  <button
    class="srl-note-accordion__toggle"
    type="button"
    :aria-expanded="props.open"
    :aria-controls="props.id"
    @click="props.toggle()"
  >
    <slot/>
  </button>
</template>