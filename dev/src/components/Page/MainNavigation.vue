<script lang="ts" setup>
import { computed, ref } from 'vue'
import { isDesktopView } from '@/composables/isDesktopView.ts'
import SvgNavArrowRight from '@/assets/images/nav-arrow-right.svg?raw'
import SvgNavArrowLeft from '@/assets/images/nav-arrow-left.svg?component'

const props = defineProps<{
  mainNavigation: NsWowNavigationItem[]
}>()

const emit = defineEmits([
  'toggle',
  'routerChange',
  'focusMain',
])

function toggle(data) {
  emit('toggle', data)
}

function routerChange() {
  emit('routerChange')
}

function focusMain() {
  emit('focusMain')
}

function addArrowRightIcon(item: NsWowNavigationItem) {
  if (item.children && item.children.length > 0) {
    item.svgAfter = SvgNavArrowRight as string
    item.children.forEach((subItem) => {
      addArrowRightIcon(subItem)
    })
  }
  return item
}

const navigation = computed<NsWowNavigationItem[]>(() => {
  const nav = []
  props.mainNavigation.forEach((item) => {
    const newItem = { ...item }
    if (isDesktopView.value) {
      newItem.children?.forEach((subItem) => {
        addArrowRightIcon(subItem)
      })
    } else {
      addArrowRightIcon(newItem)
    }
    nav.push(newItem)
  })

  return nav
})

const menu = ref<SrlMenu>()

function close() {
  focusMain()
}

function tab(e: KeyboardEvent) {
  if (isDesktopView.value) {
    close()
  } else {
    e.preventDefault()
    menu.value.closeAll()
    const elem = document.querySelector<HTMLElement>('#srl-meta-navigation > ul')
    elem?.focus()
  }
}

defineExpose({
  menu,
})
</script>

<template>
  <nav
    id="srl-page-navigation"
    class="srl-main-navigation"
    tabindex="-1"
  >
    <SrlMenu
      ref="menu"
      name="main-navigation"
      :menu="navigation"
      class="srl-main-navigation-menu"
      :backPath="[{
        label: 'Main Menu'
      }]"
      :backButtonLabel="function(backPath) {
        return $t('page.navigation.back', {label: backPath[0].label})
      }"
      @routerChange="routerChange"
      @close="close()"
      @keydown.tab.stop="tab"
      :backButtonEnabled="!isDesktopView"
      :backButtonItem="{
        svgBefore: SvgNavArrowLeft as string,
      }"
      @toggle="toggle"
    />
  </nav>
</template>
