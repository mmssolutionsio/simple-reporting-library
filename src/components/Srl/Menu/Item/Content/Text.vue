<script setup lang="ts">
const pops = defineProps<{
  item: NsWowNavigationItem
}>()
</script>

<template>
  {{ pops.item.label }}
</template>