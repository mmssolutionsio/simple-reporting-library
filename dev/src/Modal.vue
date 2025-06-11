<script setup lang="ts">
import { nextTick, ref } from 'vue'
import Autoload from '@/Autoload.ts'
import SvgClose from '@/components/Svg/Close.vue'
import VRuntimeTemplate from 'vue3-runtime-template'

const content = ref<string | null>(null)
const state = ref<boolean>(false)
const main = ref<HTMLDivElement | null>(null)

async function setContent(html: string) {
  content.value = html
  await nextTick(async () => {
    await Autoload.init(main.value)
    await open()
  })
}

async function open() {
  state.value = true
  await nextTick(() => {
    main.value.focus()
  })
}

function close() {
  state.value = false
  content.value = null
}

defineExpose({
  setContent,
  open,
  close
})
</script>

<template>
  <SrlAriaTabChain class="srl-modal" :hidden="!state" role="dialog">
    <div class="srl-modal__background srl-bg-shade-200" @click="close" />
    <div class="srl-modal__content srl-bg-light srl-color-dark" @click.stop>
      <header>
        <button
          type="button"
          class="srl-modal__close"
          :title="$t('modalClose')"
          :aria-label="$t('modalClose')"
          @click="close"
        >
          <SvgClose :title="$t('modalClose')" />
        </button>
      </header>
      <div class="srl-modal__main" ref="main" tabindex="-1">
        <VRuntimeTemplate v-if="content" :template="content" />
      </div>
    </div>
  </SrlAriaTabChain>
</template>

<style lang="scss">
@use 'nswow';

body:has(.srl-modal:not([hidden])) {
  overflow: hidden;
}

.srl-modal {
  position: fixed;
  inset: 0;
  align-items: center;
  justify-content: center;

  &:not([hidden]) {
    display: flex;
  }

  &__background {
    position: fixed;
    opacity: 0.7;
    inset: 0;
    z-index: 900;
  }

  &__content {
    position: relative;
    width: 80%;
    min-height: 80%;
    max-height: 80%;
    border-radius: 20px;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 40px;
    z-index: 901;
  }

  &__close {
    width: 50px;
    height: 50px;
    position: absolute;
    top: 0;
    right: 0;
    svg {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
