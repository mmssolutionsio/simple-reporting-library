<script setup lang="ts">
import { computed, nextTick, ref, useId, type VNode } from 'vue'
import type { Ref } from 'vue'
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
  icon?: string
  iconBefore?: string
  iconAfter?: string
  svg?: VNode | string;
  svgBefore?: VNode | string;
  svgAfter?: VNode | string;
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
  backButtonEnabled: boolean
  backButtonLabel: (backPath: NsWowNavigationItem[]) => string
  backButtonItem?: BackButtonItem
  backPath: NsWowNavigationItem[]
  path: NsWowNavigationItem[]
}>()

const breadcrumb = defineModel<NsWowNavigationItem[]>('breadcrumb', {
  required: true,
}) as Ref<NsWowNavigationItem[]>

const emit = defineEmits([
  'toggle',
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

const currentBackPath = computed<NsWowNavigationItem[]>(() => {
  if (!props.item?.attributes?.class?.includes('srl-menu__link--back')) {
    const i: NsWowNavigationItem = {
      label: props.item.label
    }
    props.item.title ? i.title = props.item.title : null
    props.item.img ? i.img = props.item.img : null
    props.item.imgBefore ? i.imgBefore = props.item.imgBefore : null
    props.item.imgAfter ? i.imgAfter = props.item.imgAfter : null
    props.item.icon ? i.icon = props.item.icon : null
    props.item.iconBefore ? i.iconBefore = props.item.iconBefore : null
    props.item.iconAfter ? i.iconAfter = props.item.iconAfter : null
    props.item.svg ? i.svg = props.item.svg : null
    props.item.svgBefore ? i.svgBefore = props.item.svgBefore : null
    props.item.svgAfter ? i.svgAfter = props.item.svgAfter : null
    props.item.attributes ? i.attributes = props.item.attributes : null
    return [i, ...props.backPath]
  }
  return props.backPath
})

const currentPath = computed<NsWowNavigationItem[]>(() => {
  return [...props.path, props.item]
})

const external = ref(props.item.href && isExternalPath(props.item.href))

const menu = ref()
const $el = ref<HTMLElement | null>(null)
const opened = ref(false)



function toggleAction() {
  opened.value = !opened.value
  if (opened.value) {
    breadcrumb.value = currentPath.value
    emit('open', { index: props.index })
    nextTick(() => {
      menu.value.$el.focus()
    })
  } else {
    menu.value.closeAll()
  }
  toggle()
}
function close() {
  breadcrumb.value = props.path
  emit('close', { index: props.index })
}

function closeSub() {
  breadcrumb.value = props.path
  if ($el.value instanceof HTMLElement) {
    $el.value.focus()
  }
}

function toggle() {
  emit('toggle')
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
  toggle()
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
  !opened.value || toggle()
  opened.value = false
  menu.value?.closeAll()
}

function findPath(): NsWowNavigationItem[] | null {
  if (opened.value) {
    if (props.item?.children?.length) {
      let res = [...props.path, props.item]
      menu.value.items.forEach((item) => {
        item.opened && (res = item.findPath() || res)
      })
      return res
    } else {
      return currentPath.value
    }
  }
  return null
}

defineExpose({
  opened,
  closeItem,
  findPath,
  $el,
  menu,
})

function internalLinkClick() {
  !props.item.callback || props.item.callback()
  routerChange()
}

function externalLinkClick() {
  !props.item.callback || props.item.callback()
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
  <li v-if="!item.children && props.item.href" role="none" :class="classListLi">
    <router-link
      v-if="!external"
      ref="$el"
      tabindex="-1"
      role="menuitem"
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
      role="menuitem"
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
  <li v-else-if="props.item.callback" role="none" :class="classListLi">
    <button
      type="button"
      ref="$el"
      tabindex="-1"
      role="menuitem"
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
  <li v-else :class="classListLi" role="none">
    <button
      type="button"
      ref="$el"
      tabindex="-1"
      role="menuitem"
      :aria-haspopup="props.item.children ? 'true' : 'false'"
      :aria-expanded="opened"
      :aria-controls="`${props.name}-${id}`"
      :class="classListItem"
      :title="props.item.title ?? props.item.label"
      :aria-label="props.item.icon ? props.item.title ?? props.item.label : undefined"
      v-bind="dynamicAttributes"
      @click.stop="toggleAction"
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
      :key="id"
      v-model:opened="opened"
      v-model:breadcrumb="breadcrumb"
      :id="`${props.name}-${id}`"
      :name="props.name"
      :menu="props.item.children"
      :disableTab="props.disableTab"
      :initOpen="props.initOpen"
      :depth="props.depth + 1"
      :disableClasses="props.disableClasses"
      :backButtonEnabled="props.backButtonEnabled"
      :backButtonLabel="props.backButtonLabel"
      :backButtonItem="props.backButtonItem"
      :path="currentPath"
      :backPath="currentBackPath"
      @link="link"
      @routerChange="emit('routerChange')"
      @tab="tab"
      @closeSub="closeSub"
      @toggle="toggle"
    />
  </li>
</template>
