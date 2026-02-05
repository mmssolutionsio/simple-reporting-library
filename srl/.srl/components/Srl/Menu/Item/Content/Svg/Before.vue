<script setup lang="ts">
import { ref, watch, computed, h, type VNode } from 'vue'

const props = defineProps<{
  item: NsWowNavigationItem
  depth: number
  disableClasses: boolean
}>();

const classListIcon = computed(() => {
  return props.disableClasses ? [] : [
    'srl-menu__link-svg-before',
    `srl-menu__link-svg-before--level-${props.depth}`
  ]
})

const svgVNode = ref<VNode | null>(null)

watch(
  props,
  async (to) => {
    if (typeof to.item.svgBefore === 'string') {
      let icon
      if (to.item.svgBefore.startsWith('data:image/svg+xml,')) {
        icon = decodeURIComponent(to.item.svgBefore.replace('data:image/svg+xml,', ''))
      } else if (!to.item.svgBefore.startsWith('<svg')) {
        try {
          const res = await fetch(to.item.svgBefore)
          if (!res.ok) {
            svgVNode.value = null
            return
          }
          icon = await res.text()
        } catch (e) {
          svgVNode.value = null
          return
        }
      } else {
        icon = to.item.svgBefore
      }

      if (!icon) {
        svgVNode.value = null
        return
      }
      const parser = new DOMParser()
      const doc = parser.parseFromString(icon, 'image/svg+xml')
      const svg = doc.querySelector('svg')
      if (!svg) {
        svgVNode.value = null
        return
      }

      const attrs = Object.fromEntries([...svg.attributes].map(attr => [attr.name, attr.value]))

      svgVNode.value = h('svg', {
        innerHTML: svg.innerHTML,
        ...attrs
      })
    } else {
      svgVNode.value = null
    }
  },
  { immediate: true }
)

const classListText = computed(() => {
  return props.disableClasses ? [] : [
    'srl-menu__link-text',
    `srl-menu__link-text--level-${props.depth}`
  ]
})
</script>

<template>
  <component :is="svgVNode" v-if="svgVNode" :class="classListIcon" />
  <component :is="props.item.svgBefore" v-else-if="typeof props.item.svgBefore === 'object'" :class="classListIcon" />
  <span :class="classListText" v-text="props.item.label"/>
</template>
