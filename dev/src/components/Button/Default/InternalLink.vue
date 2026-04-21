<script setup lang="ts">
import { computed, ref, type VNode } from 'vue'

const props = defineProps<{
  label: string;
  title?: string;
  href: string;
  callback?: () => void;
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
  svg?: VNode | string;
  svgBefore?: VNode | string;
  svgAfter?: VNode | string;
}>();

const classes = computed(() => {
  return {
    'srl-button': true,
    'srl-button--icon': props.icon || props.img || props.svg,
    'srl-has-icon': props.iconBefore || props.iconAfter || props.imgBefore || props.imgAfter || props.svgBefore || props.svgAfter,
  }
})

const $el = ref<HTMLAnchorElement>()
defineExpose({
  $el
})
</script>

<template>
  <router-link
    ref="$el"
    :to="props.href"
    :title="props.title"
    :aria-label="props.icon ? props.label : undefined"
    :class="classes"
  >
    <ButtonDefaultContent
      :label ="props.label"
      :img="props.img"
      :imgBefore="props.imgBefore"
      :imgAfter="props.imgAfter"
      :icon="props.icon"
      :iconBefore="props.iconBefore"
      :iconAfter="props.iconAfter"
      :svg="props.svg"
      :svgBefore="props.svgBefore"
      :svgAfter="props.svgAfter"
    />
  </router-link>
</template>
