<script setup lang="ts">
import { ref, watch, computed, h, type VNode } from 'vue'

const props = defineProps<{
  item: NsWowNavigationItem
  depth: number
  disableClasses: boolean
}>();

const classListIcon = computed(() => {
  return props.disableClasses ? [] : [
    'srl-menu__link-svg',
    `srl-menu__link-svg--level-${props.depth}`
  ]
})

const svgVNode = ref<VNode | null>(null)

watch(
  props,
  async (to) => {
    if (typeof to.item.svg === 'string') {
      let icon
      if (to.item.svg.startsWith('data:image/svg+xml,')) {
        icon = decodeURIComponent(to.item.svg.replace('data:image/svg+xml,', ''))
      } else if (!to.item.svg.startsWith('<svg')) {
        try {
          const res = await fetch(icon)
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
        icon = to.item.svg
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
</script>

<template>
  <component :is="svgVNode" v-if="svgVNode" :class="classListIcon" />
  <component :is="props.item.svg" v-else-if="typeof props.item.svg === 'object'" :class="classListIcon" />
</template>
