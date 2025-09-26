<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  item: NsWowNavigationItem
  depth: number
  disableClasses: boolean
}>();

const classListIcon = computed(() => {
  return props.disableClasses ? [] : [
    'srl-menu__link-image',
    `srl-menu__link-image--level-${props.depth}`
  ]
})
</script>

<template>
  <img
    :class="classListIcon"
    :src="props.item.img.src"
    :alt="props.item.img.alt ?? props.item.label"
  />
</template>
