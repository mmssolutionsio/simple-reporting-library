<script setup lang="ts">
const props = defineProps<{
  id: string
  open: boolean
}>()
</script>

<template>
<div :id="props.id" :hidden="!props.open" class="srl-note-accordion__content">
  <slot/>
</div>
</template>