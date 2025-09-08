<script setup lang="ts">
const props = defineProps<{
  item: NsWowNavigationItem
}>();

const prefix = props.item.iconPrefix ?? 'srl-icon'
</script>

<template>
  <i :class="`${prefix} ${prefix}-${props.item.icon}`" aria-hidden="true"></i>
</template>
