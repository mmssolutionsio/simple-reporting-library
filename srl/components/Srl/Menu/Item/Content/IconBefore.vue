<script setup lang="ts">
const props = defineProps<{
  item: NsWowNavigationItem;
}>();

const prefix = props.item.iconPrefix ?? 'srl-icon'
</script>

<template>
  <i :class="`${prefix} ${prefix}-${props.item.iconAfter}`" aria-hidden="true"></i>
  <span>{{ props.item.label }}</span>
</template>
