<script setup lang="ts">
import { h, ref, shallowRef, type VNode, watch } from 'vue'

const props = defineProps<{
  label: string;
  img?: {
    src: string
    alt?: string
  }
  imgBefore?: {
    src: string
    alt?: string
  }
  imgAfter?: {
    src: string
    alt?: string
  }
  icon?: string
  iconBefore?: string
  iconAfter?: string
  svg?: VNode | string
  svgBefore?: VNode | string
  svgAfter?: VNode | string
}>();

const svgVNode = shallowRef<VNode | null>(null)
const svgBeforeVNode = shallowRef<VNode | null>(null)
const svgAfterVNode = shallowRef<VNode | null>(null)

watch(
  props,
  async (to) => {
    // Svg
    if (typeof to.svg === 'object') {
      svgVNode.value = to.svg
    } else if (typeof to.svg === 'string') {
      let icon = null
      if (to.svg.startsWith('data:image/svg+xml,')) {
        icon = decodeURIComponent(to.svg.replace('data:image/svg+xml,', ''))
      } else if (!to.svg.startsWith('<svg')) {
        try {
          const res = await fetch(to.svg)
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
        icon = to.svg
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

    // Svg Before
    if (typeof to.svgBefore === 'object') {
      svgBeforeVNode.value = to.svgBefore
    } else if (typeof to.svgBefore === 'string') {
      let icon = null
      if (to.svgBefore.startsWith('data:image/svg+xml,')) {
        icon = decodeURIComponent(to.svgBefore.replace('data:image/svg+xml,', ''))
      } else if (!to.svgBefore.startsWith('<svg')) {
        try {
          const res = await fetch(to.svgBefore)
          if (!res.ok) {
            svgBeforeVNode.value = null
            return
          }
          icon = await res.text()
        } catch (e) {
          svgBeforeVNode.value = null
          return
        }
      } else {
        icon = to.svgBefore
      }

      if (!icon) {
        svgBeforeVNode.value = null
        return
      }
      const parser = new DOMParser()
      const doc = parser.parseFromString(icon, 'image/svg+xml')
      const svg = doc.querySelector('svg')
      if (!svg) {
        svgBeforeVNode.value = null
        return
      }

      const attrs = Object.fromEntries([...svg.attributes].map(attr => [attr.name, attr.value]))

      svgBeforeVNode.value = h('svg', {
        innerHTML: svg.innerHTML,
        ...attrs
      })
    } else {
      svgBeforeVNode.value = null
    }

    // Svg After
    if (typeof to.svgAfter === 'object') {
      svgAfterVNode.value = to.svgAfter
    } else if (typeof to.svgAfter === 'string') {
      let icon = null
      if (to.svgAfter.startsWith('data:image/svg+xml,')) {
        icon = decodeURIComponent(to.svgAfter.replace('data:image/svg+xml,', ''))
      } else if (!to.svgAfter.startsWith('<svg')) {
        try {
          const res = await fetch(to.svgAfter)
          if (!res.ok) {
            svgAfterVNode.value = null
            return
          }
          icon = await res.text()
        } catch (e) {
          svgAfterVNode.value = null
          return
        }
      } else {
        icon = to.svgAfter
      }

      if (!icon) {
        svgAfterVNode.value = null
        return
      }
      const parser = new DOMParser()
      const doc = parser.parseFromString(icon, 'image/svg+xml')
      const svg = doc.querySelector('svg')
      if (!svg) {
        svgAfterVNode.value = null
        return
      }

      const attrs = Object.fromEntries([...svg.attributes].map(attr => [attr.name, attr.value]))

      svgAfterVNode.value = h('svg', {
        innerHTML: svg.innerHTML,
        ...attrs
      })
    } else {
      svgAfterVNode.value = null
    }
  },
  { immediate: true }
)

</script>

<template>
  <template v-if="props.img">
    <img :src="props.img.src" :alt="props.img.alt || props.label" />
  </template>
  <template v-else-if="props.imgBefore && props.imgAfter">
    <img :src="props.imgBefore.src" :alt="props.imgBefore.alt ?? ''" aria-hidden="true" />
    <span v-text="props.label" />
    <img :src="props.imgAfter.src" :alt="props.imgAfter.alt ?? ''" aria-hidden="true" />
  </template>
  <template v-else-if="props.imgBefore">
    <img :src="props.imgBefore.src" :alt="props.imgBefore.alt ?? ''" aria-hidden="true" />
    <span v-text="props.label" />
  </template>
  <template v-else-if="props.imgAfter">
    <span v-text="props.label" />
    <img :src="props.imgAfter.src" :alt="props.imgAfter.alt ?? ''" aria-hidden="true" />
  </template>
  <template v-else-if="props.icon">
    <i :class="`srl-icon srl-icon-${props.icon}`" />
  </template>
  <template v-else-if="props.iconBefore && props.iconAfter">
    <i :class="`srl-icon srl-icon-${props.iconBefore}`" />
    <span v-text="props.label" />
    <i :class="`srl-icon srl-icon-${props.iconAfter}`" />
  </template>
  <template v-else-if="props.iconBefore">
    <i :class="`srl-icon srl-icon-${props.iconBefore}`" />
    <span v-text="props.label" />
  </template>
  <template v-else-if="props.iconAfter">
    <span v-text="props.label" />
    <i :class="`srl-icon srl-icon-${props.iconAfter}`" />
  </template>
  <template v-else-if="props.svg">
    <component :is="svgVNode" v-if="svgVNode" :aria-label="props.label" />
  </template>
  <template v-else-if="props.svgBefore && props.svgAfter">
    <component :is="svgBeforeVNode" v-if="svgBeforeVNode" aria-hidden="true" />
    <span v-text="props.label" />
    <component :is="svgAfterVNode" v-if="svgAfterVNode" aria-hidden="true" />
  </template>
  <template v-else-if="props.svgBefore">
    <component :is="svgBeforeVNode" v-if="svgBeforeVNode" aria-hidden="true" />
    <span v-text="props.label" />
  </template>
  <template v-else-if="props.svgAfter">
    <span v-text="props.label" />
    <component :is="svgAfterVNode" v-if="svgAfterVNode" aria-hidden="true" />
  </template>
  <template v-else>
    <span v-text="props.label" />
  </template>
</template>