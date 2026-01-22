<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  item: NsWowNavigationItem
  depth: number
  disableClasses: boolean
}>();

const classListIcon = computed(() => {
  return props.disableClasses ? [] : [
    'srl-menu__link-image-after',
    `srl-menu__link-image-after--level-${props.depth}`
  ]
})

const classListText = computed(() => {
  return props.disableClasses ? [] : [
    'srl-menu__link-text',
    `srl-menu__link-text--level-${props.depth}`
  ]
})
</script>

<template>
  <span :class="classListText" v-text="props.item.label"/>
  <img
    :class="classListIcon"
    :src="props.item.imgAfter?.src"
    :alt="props.item.imgAfter?.alt ?? props.item.label"
  />
</template>
