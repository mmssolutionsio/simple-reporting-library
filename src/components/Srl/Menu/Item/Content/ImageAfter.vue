<script setup lang="ts">
const props = defineProps<{
  item: NsWowNavigationItem
}>()
</script>

<template>
  <span>{{ props.item.label }}</span>
  <img
    :src="props.item.imgAfter.src"
    :alt="props.item.imgAfter.alt ?? props.item.label"
  />
</template>