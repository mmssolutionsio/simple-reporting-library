<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import MenuItemContent from './Item/Content.vue'
import MenuList from './List.vue'
import type { RouterLink } from 'vue-router'
import getUuid from '../../../composables/uuid';

const props = defineProps<{
  name: string
  item: NsWowNavigationItem
  index: number | string
  disableTab: boolean
  disableTabIndex: boolean
  initOpen: number
  depth: number
}>()

const emit = defineEmits(['open', 'close', 'link', 'routerChange', 'next', 'prev', 'tab', 'back'])
const id = ref<number | string | undefined>()
if (props.item.children) {
  id.value = getUuid()
}

const external = ref(
  props.item.href
    && (
      props.item.href.startsWith('http')
      || props.item.href?.startsWith('//')
      || props.item.href?.startsWith('mailto')
      || props.item.href?.startsWith('tel')
      || props.item.href?.startsWith('sms')
      || props.item.href?.startsWith('callto')
      || props.item.href?.startsWith('skype')
      || props.item.href?.startsWith('sip')
      || props.item.href?.startsWith('ws')
      || props.item.href?.startsWith('wss')
      || props.item.href?.startsWith('irc')
      || props.item.href?.startsWith('gopher')
      || props.item.href?.startsWith('whatsapp')
  )
)

const menu = ref()
const $el = ref<HTMLButtonElement | HTMLAnchorElement | typeof RouterLink>()
const opened = ref(false)

function toggle() {
  opened.value = !opened.value
  if (opened.value) {
    emit('open', { index: props.index })
    nextTick(() => {
      const item = menu.value?.items[0].$el
      item.$el ? item.$el.focus() : item.focus()
    })
  }
}

function close() {
  emit('close', { index: props.index })
}

function closeSub() {
  $el.value?.focus()
}

function next() {
  emit('next', { index: props.index })
}

function prev() {
  emit('prev', { index: props.index })
}

function tab(event: KeyboardEvent) {
  if (props.disableTab && event) {
    event.stopPropagation()
    event.preventDefault()
    opened.value = false
  }
  emit('tab')
}

function back(event: KeyboardEvent) {
  if (props.disableTab && event) {
    event.stopPropagation()
    event.preventDefault()
  }
  emit('back')
}

function link() {
  emit('link')
}

function routerChange() {
  emit('link')
  emit('routerChange')
}

function closeItem() {
  opened.value = false
  menu.value?.closeAll()
}

defineExpose({
  closeItem, $el, menu
})

const dynamicAttributes = computed(() => {
  return props.item.attributes ?? {}
})
</script>

<template>
  <li v-if="!item.children && props.item.href">
    <router-link
      v-if="!external"
      ref="$el"
      :tabindex="props.index === 0 && !props.disableTabIndex ? 0 : -1"
      :to="props.item.href"
      :class="{active: item.active}"
      :title="props.item.title ?? props.item.label"
      v-bind="dynamicAttributes"
      @click="routerChange"
      @keydown.left.stop.prevent="prev"
      @keydown.up.stop.prevent="prev"
      @keydown.down.stop.prevent="next"
      @keydown.right.stop.prevent="next"
      @keydown.tab.exact="tab"
      @keydown.shift.tab.exact="back"
      @keydown.esc.stop.prevent="close"
      @keydown.enter="link"
    >
      <MenuItemContent :item="props.item" />
    </router-link>
    <a
      v-else
      :tabindex="props.index === 0 && !props.disableTabIndex ? 0 : -1"
      ref="$el"
      :href="props.item.href"
      :title="props.item.title ?? props.item.label"
      :target="props.item.href?.startsWith('http') ? '_blank' : undefined"
      v-bind="dynamicAttributes"
      @click="link"
      @keydown.left.stop.prevent="prev"
      @keydown.up.stop.prevent="prev"
      @keydown.down.stop.prevent="next"
      @keydown.right.stop.prevent="next"
      @keydown.tab.exact="tab"
      @keydown.shift.tab.exact="back"
      @keydown.esc.stop.prevent="close"
    >
      <MenuItemContent :item="props.item" />
    </a>
  </li>
  <li v-else-if="props.item.callback">
    <button
      type="button"
      ref="$el"
      :tabindex="props.index === 0 && !props.disableTabIndex ? 0 : -1"
      :title="props.item.title ?? props.item.label"
      v-bind="dynamicAttributes"
      @click="props.item.callback"
      @keydown.left.stop.prevent="prev"
      @keydown.up.stop.prevent="prev"
      @keydown.down.stop.prevent="next"
      @keydown.right.stop.prevent="next"
      @keydown.tab.exact="tab"
      @keydown.shift.tab.exact="back"
      @keydown.esc.stop.prevent="close"
    >
      <MenuItemContent :item="props.item" />
    </button>
  </li>
  <li v-else>
    <button
      type="button"
      ref="$el"
      :tabindex="props.index === 0 ? 0 : -1"
      :aria-haspopup="props.item.children ? 'true' : 'false'"
      :aria-expanded="opened"
      :aria-controls="`${props.name}-${id}`"
      :title="props.item.title ?? props.item.label"
      v-bind="dynamicAttributes"
      @click="toggle"
      @keydown.left.stop.prevent="prev"
      @keydown.up.stop.prevent="prev"
      @keydown.down.stop.prevent="next"
      @keydown.right.stop.prevent="next"
      @keydown.tab.exact="tab"
      @keydown.shift.tab.exact="back"
      @keydown.esc.stop.prevent="close"
    >
      <MenuItemContent :item="props.item" />
    </button>
    <MenuList
      v-if="props.item.children"
      ref="menu"
      :id="`${props.name}-${id}`"
      :name="props.name"
      :menu="props.item.children"
      :disableTab="props.disableTab"
      :initOpen="props.initOpen"
      :depth="props.depth + 1"
      v-model:opened="opened"
      @link="link"
      @routerChange="emit('routerChange')"
      @tab="tab"
      @closeSub="closeSub"
    />
  </li>
</template>
