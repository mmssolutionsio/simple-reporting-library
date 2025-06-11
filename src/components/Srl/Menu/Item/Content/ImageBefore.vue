<script setup lang="ts">
const props = defineProps<{
  item: NsWowNavigationItem;
}>();
</script>

<template>
  <img
    :src="props.item.imgBefore.src"
    :alt="props.item.imgBefore.alt ?? props.item.label"
  />
  <span>{{ props.item.label }}</span>
</template>
