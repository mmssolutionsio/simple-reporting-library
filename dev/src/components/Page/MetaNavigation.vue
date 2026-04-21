<script setup lang="ts">
import { useConfig, useLanguageSwitch } from '#composables'
import { useGlobalLinks } from '@/composables/globalLinks.ts'
import { isDesktopView } from '@/composables/isDesktopView.ts'
import { computed, ref } from 'vue'

import SvgDownload from 'assets/images/download.svg?component'
import SvgSearch from 'assets/images/search.svg?component'
import SvgChevronDown from 'assets/images/chevron-down.svg?component'

const config = useConfig()
const globalLinks = useGlobalLinks()
const languages = useLanguageSwitch()

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

const menu = ref<SrlMenu>()

const metaNav = computed<NsWowNavigationItem[]>(() => {
  const nav = [];
  if (config.value.settings.languages.length > 1) {
    nav.push({
      label: languages.value.current.label.toUpperCase(),
      iconAfter: 'chevron-down',
      children: languages.value.items.map((i) => {
        return {
          label: i.label.toUpperCase(),
          href: i.href,
        }
      }),
      attributes: {
        class: 'srl-button'
      }
    })
  }

  if (globalLinks.value.downloads) {
    nav.push({
      label: 'Downloads',
      href: globalLinks.value.downloads.href,
      //svg: SvgDownload,
      icon: 'download',
      attributes: {
        class: 'srl-button srl-button--icon'
      }
    })
  }

  if (globalLinks.value.search) {
    nav.push({
      label:globalLinks.value.search.label,
      href: globalLinks.value.search.href,
      //svg: SvgSearch,
      icon: 'search',
      attributes: {
        class: 'srl-button srl-button--icon'
      }
    })
  }

  return nav;
})

function close() {
  focusMain()
}

function tab(e: KeyboardEvent) {
  if (isDesktopView.value) {
    close()
  } else {
    e.preventDefault()
    const elem = document.querySelector<HTMLElement>('#srl-page-navigation > ul')
    elem?.focus()
  }
}

defineExpose({
  menu,
})
</script>

<template>
  <nav
    id="srl-meta-navigation"
    class="srl-meta-navigation"
    tabindex="-1"
  >
    <SrlMenu
      ref="menu"
      name="meta-navigation"
      :menu="metaNav"
      class="srl-meta-navigation__menu"
      @toggle="toggle"
      @routerChange="routerChange"
      @close="close"
      @keydown.tab="tab"
    />
  </nav>
</template>