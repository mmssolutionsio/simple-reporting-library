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
    `${prefix}-${props.item.iconAfter}`,
  ]
  if (!props.disableClasses) {
    res.push('srl-menu__link-icon-after')
    res.push(`srl-menu__link-icon-after--level-${props.depth}`)
  }
  return res
})

const classListText = computed(() => {
  return props.disableClasses? [] : [
  'srl-menu__link-text',
  `srl-menu__link-text--level-${props.depth}`
  ]
})
</script>

<template>
  <span :class="classListText" v-text="props.item.label"/>
  <i :class="classListIcon" aria-hidden="true"></i>
</template>
