<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  item: NsWowNavigationItem
  depth: number
  disableClasses: boolean
}>();

const prefix = props.item.iconPrefix ?? 'srl-icon'

const classListIcon = computed(() => {
  const res = [
    `${prefix}`,
    `${prefix}-${props.item.icon}`,
  ]
  if (!props.disableClasses) {
    res.push('srl-menu__link-icon')
    res.push(`srl-menu__link-icon--level-${props.depth}`)
  }
  return res
})
</script>

<template>
  <i :class="classListIcon" aria-hidden="true"></i>
</template>
