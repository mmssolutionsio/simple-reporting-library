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
import { ref } from 'vue';
import MenuItem from './Item.vue';

const props = withDefaults(
  defineProps<{
    name: string;
    menu: NsWowNavigationItem[];
    disableTab?: boolean;
    disableTabIndex?: boolean;
    initOpen?: number;
    singleOpen?: boolean;
    depth?: number;
  }>(),
  {
    disableTab: false,
    disableTabIndex: false,
    initOpen: 0,
    singleOpen: true,
    depth: 0,
  },
);

const emit = defineEmits([
  'close',
  'closeSub',
  'link',
  'routerChange',
  'nextExceeded',
  'prevExceeded',
  'tab',
  'back',
]);
const items = ref<Array<typeof MenuItem>>([]);

const opened = defineModel('opened', { type: Boolean, default: true });

function open(event: { index: number }) {
  if (props.singleOpen) {
    closeAll(event.index);
  }
}

function close() {
  if (props.initOpen < props.depth) {
    opened.value = false;
    emit('closeSub');
  } else {
    emit('close');
  }
}

function next(event: { index: number }) {
  let newIndex = event.index + 1;
  let exceeded = false;
  if (newIndex >= items.value.length) {
    exceeded = true;
    newIndex = 0;
  }
  const item = items.value[newIndex].$el;
  item.$el ? item.$el.focus() : item.focus();
  !exceeded || emit('nextExceeded');
}

function prev(event: { index: number }) {
  let newIndex = event.index - 1;
  let exceeded = false;
  if (newIndex < 0) {
    exceeded = true;
    newIndex = items.value.length - 1;
  }
  const item = items.value[newIndex].$el;
  item.$el ? item.$el.focus() : item.focus();
  !exceeded || emit('prevExceeded');
}

function tab() {
  emit('tab');
}

function back() {
  emit('back');
}

function link() {
  emit('link');
}

function routerChange() {
  emit('routerChange');
}

function closeAll(keep?: number | string) {
  items.value.forEach((item: typeof MenuItem, index: number) => {
    if (keep !== index) item.closeItem();
  });
}

const $el = ref<HTMLUListElement>();

defineExpose({
  closeAll,
  $el,
  items,
});
</script>

<template>
  <ul ref="$el" :hidden="!opened">
    <template v-for="(item, index) in props.menu" :key="index">
      <MenuItem
        ref="items"
        :item="item"
        :name="props.name"
        :index="index"
        :disableTab="props.disableTab"
        :disableTabIndex="props.disableTabIndex"
        :initOpen="props.initOpen"
        :depth="props.depth"
        @open="open"
        @close="close"
        @next="next"
        @prev="prev"
        @tab="tab"
        @back="back"
        @link="link"
        @routerChange="routerChange"
      />
    </template>
  </ul>
</template>

<style scoped lang="scss"></style>
