<script setup lang="ts">
const pops = defineProps<{
  item: NsWowNavigationItem;
}>();
</script>

<template>
  <span>{{ pops.item.label }}</span>
</template>
