<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  item: NsWowNavigationItem
  depth: number
  disableClasses: boolean
}>();

const classListIcon = computed(() => {
  return props.disableClasses ? [] : [
    'srl-menu__link-image-before',
    `srl-menu__link-image-before--level-${props.depth}`
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
  <img
    :class="classListIcon"
    :src="props.item.imgBefore.src"
    :alt="props.item.imgBefore.alt ?? props.item.label"
  />
  <span :class="classListText" v-text="props.item.label"/>
</template>
