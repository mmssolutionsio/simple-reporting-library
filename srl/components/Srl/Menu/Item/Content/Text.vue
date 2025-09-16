<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  item: NsWowNavigationItem
  depth: number
  disableClasses: boolean
}>();

const classListText = computed(() => {
  return props.disableClasses ? [] : [
    'srl-menu__link-text',
    `srl-menu__link-text--level-${props.depth}`
  ]
})
</script>

<template>
  <span :class="classListText" v-text="props.item.label"/>
</template>
