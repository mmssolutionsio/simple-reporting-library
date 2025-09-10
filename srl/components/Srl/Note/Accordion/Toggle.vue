<script setup lang="ts">
const props = defineProps<{
  id: string
  open: boolean
  toggle: () => void
}>()
</script>

<template>
  <button @click="props.toggle()" :aria-expanded="props.open" :aria-controls="props.id">
    <slot/>
  </button>
</template>