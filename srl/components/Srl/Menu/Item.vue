<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue'
import type { RouterLink } from 'vue-router'
import { isExternalPath } from '#utils/uri'

type BackButtonItem = {
  title?: string
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
  attributes?: {
    [key: string]: string
  }
}

const props = defineProps<{
  name: string
  item: NsWowNavigationItem
  index: number | string
  disableTab: boolean
  disableTabIndex: boolean
  initOpen: number
  depth: number
  disableClasses: boolean
  backButonEnabled?: boolean
  backButtonLabel?: string
  backButtonItem: BackButtonItem
}>()

const emit = defineEmits([
  'open',
  'close',
  'link',
  'routerChange',
  'next',
  'prev',
  'tab',
  'back',
])
const id = ref<number | string | undefined>()
if (props.item.children) {
  id.value = useId()
}

const external = ref(props.item.href && isExternalPath(props.item.href))

const menu = ref()
const $el = ref<HTMLButtonElement | HTMLAnchorElement | typeof RouterLink>()
const opened = ref(false)

function toggle() {
  opened.value = !opened.value
  if (opened.value) {
    emit('open', { index: props.index })
    nextTick(() => {
      menu.value.$el.focus()
    })
  } else {
    menu.value.closeAll()
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
  !props.item.callback || props.item.callback()
  emit('link')
}

function routerChange() {
  !props.item.callback || props.item.callback()
  emit('link')
  emit('routerChange')
}

function closeItem() {
  opened.value = false
  menu.value?.closeAll()
}

defineExpose({
  closeItem,
  $el,
  menu,
})

function internalLinkClick(event: Event) {
  !props.item.callback || props.item.callback(event)
  routerChange()
}

function externalLinkClick(event: Event) {
  !props.item.callback || props.item.callback(event)
  link()
}

const dynamicAttributes = computed(() => {
  return props.item.attributes ?? {}
})

const classListLi = computed(() => {
  if (props.disableClasses) return []

  const res = [
    'srl-menu__item'
  ]
  res.push(`srl-menu__item--level-${props.depth}`)
  if (props.item.children) {
    res.push('srl-menu__item--has-children')
  } else {
    res.push('srl-menu__item--has-no-children')
  }
  return res
})

const classListItem = computed(() => {
  const res = []

  !props.item.active || res.push('srl-menu__link--active')

  if (!props.disableClasses) {
    res.push('srl-menu__link')
    res.push(`srl-menu__link--level-${props.depth}`)
  }
  return res
})

</script>

<template>
  <li v-if="!item.children && props.item.href" :class="classListLi">
    <router-link
      v-if="!external"
      ref="$el"
      tabindex="-1"
      :to="props.item.href"
      :class="classListItem"
      :title="props.item.title ?? props.item.label"
      v-bind="dynamicAttributes"
      @click="internalLinkClick"
      @keydown.left.stop.prevent="prev"
      @keydown.up.stop.prevent="prev"
      @keydown.down.stop.prevent="next"
      @keydown.right.stop.prevent="next"
      @keydown.tab.exact="tab"
      @keydown.shift.tab.exact="back"
      @keydown.esc.stop.prevent="close"
    >
      <SrlMenuItemContent
        :item="props.item"
        :depth="props.depth"
        :disableClasses="props.disableClasses"
      />
    </router-link>
    <a
      v-else
      tabindex="-1"
      ref="$el"
      :href="props.item.href"
      :title="props.item.title ?? props.item.label"
      :class="classListItem"
      :aria-label="props.item.icon ? props.item.title ?? props.item.label : undefined"
      :target="props.item.href?.startsWith('http') ? '_blank' : undefined"
      v-bind="dynamicAttributes"
      @click="externalLinkClick"
      @keydown.left.stop.prevent="prev"
      @keydown.up.stop.prevent="prev"
      @keydown.down.stop.prevent="next"
      @keydown.right.stop.prevent="next"
      @keydown.tab.exact="tab"
      @keydown.shift.tab.exact="back"
      @keydown.esc.stop.prevent="close"
    >
      <SrlMenuItemContent
        :item="props.item"
        :depth="props.depth"
        :disableClasses="props.disableClasses"
      />
    </a>
  </li>
  <li v-else-if="props.item.callback" :class="classListLi">
    <button
      type="button"
      ref="$el"
      tabindex="-1"
      :class="classListItem"
      :title="props.item.title ?? props.item.label"
      :aria-label="props.item.icon ? props.item.title ?? props.item.label : undefined"
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
      <SrlMenuItemContent
        :item="props.item"
        :depth="props.depth"
        :disableClasses="props.disableClasses"
      />
    </button>
  </li>
  <li v-else :class="classListLi">
    <button
      type="button"
      ref="$el"
      tabindex="-1"
      :aria-haspopup="props.item.children ? 'true' : 'false'"
      :aria-expanded="opened"
      :aria-controls="`${props.name}-${id}`"
      :class="classListItem"
      :title="props.item.title ?? props.item.label"
      :aria-label="props.item.icon ? props.item.title ?? props.item.label : undefined"
      v-bind="dynamicAttributes"
      @click.stop="toggle"
      @keydown.left.stop.prevent="prev"
      @keydown.up.stop.prevent="prev"
      @keydown.down.stop.prevent="next"
      @keydown.right.stop.prevent="next"
      @keydown.tab.exact="tab"
      @keydown.shift.tab.exact="back"
      @keydown.esc.stop.prevent="close"
    >
      <SrlMenuItemContent
        :item="props.item"
        :depth="props.depth"
        :disableClasses="props.disableClasses"
      />
    </button>
    <SrlMenu
      v-if="props.item.children"
      ref="menu"
      :id="`${props.name}-${id}`"
      :name="props.name"
      :menu="props.item.children"
      :disableTab="props.disableTab"
      :initOpen="props.initOpen"
      :depth="props.depth + 1"
      :disableClasses="props.disableClasses"
      :backButonEnabled="props.backButonEnabled"
      :backButtonLabel="props.backButonEnabled ? props.item.label : undefined"
      :backButtonItem="props.backButtonItem"
      v-model:opened="opened"
      @link="link"
      @routerChange="emit('routerChange')"
      @tab="tab"
      @closeSub="closeSub"
    />
  </li>
</template>
