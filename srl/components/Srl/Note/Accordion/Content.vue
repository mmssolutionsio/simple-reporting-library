<script setup lang="ts">
const props = defineProps<{
  id: string
  open: boolean
}>()
</script>

<template>
<div :id="props.id" :hidden="!props.open">
  <slot/>
</div>
</template>