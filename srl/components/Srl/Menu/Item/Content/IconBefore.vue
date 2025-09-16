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
    `${prefix}-${props.item.iconBefore}`,
  ]

  if (!props.disableClasses) {
    res.push('srl-menu__link-icon-before')
    res.push(`srl-menu__link-icon-before--level-${props.depth}`)
  }
  return res
})

const classListText =  computed(() => {
  return [
    'srl-menu__link-text',
    `srl-menu__link-text--level-${props.depth}`
  ]
})
</script>

<template>
  <i :class="classListIcon" aria-hidden="true"></i>
  <span :class="classListText" v-text="props.item.label"/>
</template>
