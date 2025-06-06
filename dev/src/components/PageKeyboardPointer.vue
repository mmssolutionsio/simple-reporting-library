<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const pointer = ref<NsWowNavigationItem[]>([
  {
    label: t('toMainNavigation'),
    attributes: {
      id: 'srl-to-main-navigation',
    },
    callback: () => {
      const elem: HTMLDivElement | null = document.querySelector('#srl-page__navigation')
      if (elem) {
        elem.querySelector('button')?.focus()
      }
    }
  },
  {
    label: t('toMainContent'),
    attributes: {
      id: 'srl-to-main-content',
    },
    callback: () => {
      const elem: HTMLDivElement | null = document.querySelector('#srl-page__main')
      if (elem) {
        elem.focus()
      }
    }
  },
  {
    label: t('toFooter'),
    attributes: {
      id: 'srl-to-footer',
    },
    callback: () => {
      const elem: HTMLDivElement | null = document.querySelector('#srl-page__footer')
      if (elem) {
        elem.focus()
      }
    }
  }
])
</script>

<template>
  <nav class="srl-page__keyboardpointer" id="srl-page__keyboardpointer" tabindex="-1">
    <SrlMenu name="keyboardpointer" :menu="pointer"/>
  </nav>
</template>

<style lang="scss">
@use "srl";

.srl-page__keyboardpointer {

  overflow: hidden;
  height: 0;

  &:has(button:focus) {
    height: auto;
    @include srl.spacer-padding-block(medium);
  }

  ul {
    list-style: none;
    margin: 0 auto;
    padding: 0 var(--srl-container-padding);
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: var(--srl-gutter-column-gap);
    row-gap: var(--srl-gutter-row-gap);
    max-width: var(--srl-container-max-width);
  }

  li {
    margin: 0 0 0 srl.system-size-unit(-15);
    padding: 0;
  }

  button {
    @include srl.typography-copy1();
    padding-block: srl.system-size-unit(5);
    padding-inline: srl.system-size-unit(15);
    background-color: transparent;
    border: 0;
  }
}

</style>