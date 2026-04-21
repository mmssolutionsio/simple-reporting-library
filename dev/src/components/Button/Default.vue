<script setup lang="ts">
import { isRouterPath } from '#utils'
import { computed, onMounted, ref, type VNode } from 'vue'

const props = withDefaults(defineProps<{
  label: string;
  title?: string;
  href?: string;
  type?: 'button' | 'link' | 'submit';
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
}>(), {
  type: 'button',
  callback: () => {},
})

const title = computed(() => props.title || props.label || undefined )

const child = ref<ButtonDefaultInternalLink | ButtonDefaultExternalLink | ButtonDefaultAction>()

const $el = ref<HTMLAnchorElement | HTMLButtonElement>()

onMounted(() => {
  if (child.value && child.value.$el) {
    $el.value = child.value.$el
  }
})

defineExpose({
  $el
})
</script>

<template>
  <ButtonDefaultInternalLink
    v-if="props.href && isRouterPath(props.href)"
    ref="child"
    :title="title"
    :label="props.label"
    :href="props.href"
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
  <ButtonDefaultExternalLink
    v-else-if="props.href"
    ref="child"
    :title="title"
    :label="props.label"
    :href="href"
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
  <ButtonDefaultAction
    v-else-if="props.callback"
    ref="child"
    :title="title"
    :label="props.label"
    :type="props.type"
    :callback="props.callback"
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
</template>
