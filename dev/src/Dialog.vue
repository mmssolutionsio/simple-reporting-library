<script setup lang="ts">
import VRuntimeTemplate from 'vue3-runtime-template'
import SvgClose from '@/components/Svg/Close.vue'

const props = withDefaults(
  defineProps<{
    header?: string
    content: string
  }>(),
  {
    header: '',
    content: ''
  }
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

function close() {
  emit('close')
}
</script>

<template>
  <div class="srl-dialog srl-bg-light srl-color-dark" @click.stop>
    <header class="srl-dialog__header">
      <h2 v-if="props.header !== ''" class="srl-dialog__title" v-html="props.header" />
      <button
        type="button"
        class="srl-dialog__close"
        :title="$t('modalClose')"
        :aria-label="$t('modalClose')"
        @click="close"
      >
        <SvgClose :title="$t('modalClose')" />
      </button>
    </header>
    <main class="srl-dialog__main srl-article-root" tabindex="-1">
      <VRuntimeTemplate v-if="props.content !== ''" :template="props.content" />
    </main>
  </div>
</template>

<style lang="scss">
@use 'srl';

body:has(.srl-page__dialog[open]) {
  overflow: hidden;
}

.srl-page__dialog {
  display: block;
  padding: 0;
  border: 0;
  border-radius: srl.system-size-unit(16);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  position: fixed;
  inset: 0;
  margin: 10vh auto 0;

  &::backdrop {
    background-color: rgba(0, 0, 0, 0.3);
    z-index: -1;
  }

  &[open] {
    opacity: 1;
    pointer-events: all;
  }
}

.srl-dialog {
  width: 80vw;
  height: 80vh;

  &__close {
    width: srl.system-size-unit(50);
    height: srl.system-size-unit(50);
    position: absolute;
    top: 0;
    right: srl.system-size-unit(20);
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__main {
    padding: srl.system-size-unit(40);
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
