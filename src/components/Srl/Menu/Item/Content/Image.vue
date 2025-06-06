<script setup lang="ts">
const props = defineProps<{
  item: NsWowNavigationItem
}>()
</script>

<template>
  <img
    :src="props.item.img.src"
    :alt="props.item.img.alt ?? props.item.label"
  />
</template>