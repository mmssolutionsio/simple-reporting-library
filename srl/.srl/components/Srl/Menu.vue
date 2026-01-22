<script setup lang="ts">
/**
 * `SrlMenu.vue`
 *
 * This Vue 3 component implements a hierarchical menu system with various navigation capabilities.
 * It manages a list of menu items with support for opening/closing items, keyboard navigation,
 * and parent-child menu relationships.
 *
 * ## Props
 * - `name`: String - Identifier for the menu
 * - `menu`: Array<NsWowNavigationItem> - Menu items data structure
 * - `disableTab`: Boolean - Disables tab navigation when true (default: false)
 * - `disableTabIndex`: Boolean - Disables tabindex attributes when true (default: false)
 * - `initOpen`: Number - Initial depth level that should be open (default: 0)
 * - `singleOpen`: Boolean - Only allows one menu item to be open at a time (default: true)
 * - `depth`: Number - Current depth level of this menu (default: 0)
 *
 * ## Emits
 * - `close`: When the menu is closed
 * - `closeSub`: When a submenu is closed
 * - `link`: When a link item is activated
 * - `routerChange`: When navigation occurs via router
 * - `nextExceeded`, `prevExceeded`: When navigation exceeds boundaries
 * - `tab`: When tab navigation occurs
 * - `back`: When back navigation is triggered
 *
 * ## Reactive Variables
 * - `items`: Reference array to MenuItem components
 * - `opened`: v-model for the open/closed state of the menu
 * - `$el`: Reference to the root <ul> element
 *
 * ## Methods
 * - `open(event)`: Opens a menu item, closing others if singleOpen is true
 * - `close()`: Closes the current menu or emits close events based on depth
 * - `next(event)`: Focuses the next menu item with circular navigation
 * - `prev(event)`: Focuses the previous menu item with circular navigation
 * - `closeAll(keep?)`: Closes all menu items except the one specified by index
 *
 * ## Exposed API
 * - `closeAll`: Method to close all menu items except one (optional)
 * - `$el`: Reference to the root element
 * - `items`: Array of menu item components
 *
 * ## Usage Example
 * ```vue
 * <SrlMenuList
 *   name="main-nav"
 *   :menu="navigationItems"
 *   :singleOpen="true"
 *   @link="handleNavigation"
 * />
 */
import { computed, ref, VNode } from 'vue'

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

const props = withDefaults(
  defineProps<{
    name: string
    menu: NsWowNavigationItem[]
    id?: string
    disableTab?: boolean
    disableTabIndex?: boolean
    initOpen?: number
    singleOpen?: boolean
    depth?: number
    disableClasses?: boolean
    backButtonEnabled?: boolean
    backButtonLabel?: (backPath: NsWowNavigationItem[]) => string
    backButtonItem?: BackButtonItem
    path?: NsWowNavigationItem[]
    backPath?: NsWowNavigationItem[]
  }>(),
  {
    disableTab: false,
    disableTabIndex: false,
    initOpen: 0,
    singleOpen: true,
    depth: 0,
    disableClasses: false,
    backButtonLabel: function(backPath: NsWowNavigationItem[]) {
      return backPath[0]?
        backPath[0]?.label ?? 'Back' : 'Back'
    },
  },
)

const emit = defineEmits([
  'toggle',
  'close',
  'closeSub',
  'link',
  'routerChange',
  'nextExceeded',
  'prevExceeded',
  'tab',
  'back',
])
const items = ref<SrlMenuItem[]>([])

const opened = defineModel('opened', { type: Boolean, default: true })
const breadcrumb = defineModel('breadcrumb', {
  type: Array,
  default: [],
})

function open(event: { index: number }) {
  if (props.singleOpen) {
    closeAll(event.index)
  }
}

function close() {
  if (props.initOpen < props.depth) {
    opened.value = false
    emit('closeSub')
  } else {
    emit('close')
  }
  toggle()
}

function next(event: { index: number }) {
  let newIndex = event.index + 1
  let exceeded = false
  if (newIndex >= items.value.length) {
    exceeded = true
    newIndex = 0
  }
  const item = items.value[newIndex].$el
  item.$el ? item.$el.focus() : item.focus()
  !exceeded || emit('nextExceeded')
}

function prev(event: { index: number }) {
  let newIndex = event.index - 1
  let exceeded = false
  if (newIndex < 0) {
    exceeded = true
    newIndex = items.value.length - 1
  }
  const item = items.value[newIndex].$el
  item.$el ? item.$el.focus() : item.focus()
  !exceeded || emit('prevExceeded')
}

function tab() {
  emit('tab')
}

function back() {
  emit('back')
}

function link() {
  emit('link')
}

function routerChange() {
  emit('routerChange')
}

function toggle() {
  emit('toggle')
}

function closeAll(keep?: number | string) {
  let findCurrentPath = null
  items.value.forEach((item: SrlMenuItem, index: number) => {
    if (keep !== index) {
      item.closeItem()
    }
      const currentPath = item.findPath()
      if (currentPath) {
        findCurrentPath = currentPath
      }
  })
  if (findCurrentPath) {
    breadcrumb.value = findCurrentPath
  } else {
    breadcrumb.value = props.path && props.path.length ?
      props.path.slice(0, -1) : []
  }
}

const $el = ref<HTMLUListElement>()

function focusClickable(index: number) {
  if (items.value[index]) {
    if (items.value[index].$el.$el) {
      items.value[index].$el.$el.focus()
    } else if (items.value[index].$el) {
      items.value[index].$el.focus()
    }
  }
}

const menuItems = computed<NsWowNavigationItem[]>(() => {
  const classes: string[] = []
  const backButtonAttributes = props.backButtonItem?.attributes
  if (backButtonAttributes && backButtonAttributes.class.length > 0) {
    backButtonAttributes.class.split(' ').forEach(c => {
      if (c) classes.push(c)
    })
  }
  classes.push('srl-menu__link--back')

  let backLabel: string = props.backButtonLabel(props.backPath ?? [])

  if
    (props.backButtonEnabled &&
    props.depth &&
    props.backButtonItem
  ) {
    const backItem: NsWowNavigationItem = {
      label: backLabel,
    }
    props.backButtonItem.title ? backItem.title = props.backButtonItem.title : null
    props.backButtonItem.img ? backItem.img = props.backButtonItem.img : null
    props.backButtonItem.imgBefore ? backItem.imgBefore = props.backButtonItem.imgBefore : null
    props.backButtonItem.imgAfter ? backItem.imgAfter = props.backButtonItem.imgAfter : null
    props.backButtonItem.icon ? backItem.icon = props.backButtonItem.icon : null
    props.backButtonItem.iconBefore ? backItem.iconBefore = props.backButtonItem.iconBefore : null
    props.backButtonItem.iconAfter ? backItem.iconAfter = props.backButtonItem.iconAfter : null
    props.backButtonItem.svg ? backItem.svg = props.backButtonItem.svg : null
    props.backButtonItem.svgBefore ? backItem.svgBefore = props.backButtonItem.svgBefore : null
    props.backButtonItem.svgAfter ? backItem.svgAfter = props.backButtonItem.svgAfter : null
    backItem.attributes = {
      ...(props.backButtonItem.attributes ?? {}),
      class: classes.join(' '),
      'aria-controls': props.id ?? '',
      'aria-expanded': String(opened.value)
    }
    backItem.callback = close
    return [backItem, ...props.menu]
  }
  return props.menu
})

const classList = computed(() => {
  return props.disableClasses ? [] : [
    'srl-menu',
    `srl-menu--level-${props.depth}`,
  ]
})

defineExpose({
  closeAll,
  $el,
  items,
  breadcrumb,
})

</script>

<template>
  <ul
    ref="$el"
    tabindex="0"
    :role="props.depth === 0 ? 'menubar' : 'menu'"
    :id="props.id"
    :class="classList"
    :hidden="!opened"
    @keydown.esc.prevent.stop="close"
    @keydown.up.prevent.stop="focusClickable(menuItems.length - 1)"
    @keydown.right.prevent.stop="focusClickable(0)"
    @keydown.down.prevent.stop="focusClickable(0)"
    @keydown.left.prevent.stop="focusClickable(menuItems.length - 1)"
  >
    <template v-for="(item, index) in menuItems" :key="index">
      <SrlMenuItem
        ref="items"
        v-model:breadcrumb="breadcrumb"
        :item="item"
        :name="props.name"
        :index="index"
        :disableTab="props.disableTab"
        :disableTabIndex="props.disableTabIndex"
        :initOpen="props.initOpen"
        :depth="props.depth"
        :disableClasses="props.disableClasses"
        :backButtonEnabled="props.backButtonEnabled"
        :backButtonLabel="props.backButtonLabel"
        :backButtonItem="props.backButtonItem"
        :path="props.path ?? []"
        :backPath="props.backPath ?? []"
        @open="open"
        @close="close"
        @next="next"
        @prev="prev"
        @tab="tab"
        @back="back"
        @link="link"
        @routerChange="routerChange"
        @toggle="toggle"
      />
    </template>
  </ul>
</template>

<style scoped lang="scss"></style>
