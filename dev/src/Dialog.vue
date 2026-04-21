<script setup lang="ts">
import VRuntimeTemplate from 'vue3-runtime-template'

const props = withDefaults(
  defineProps<{
    header?: string
    content?: string
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
      <div v-if="props.header !== '' || $slots.header" class="srl-dialog__header--body">
        <h2 v-if="props.header !== ''" class="srl-dialog__title" v-html="props.header" />
        <slot name="header"/>
      </div>
      <button
        type="button"
        class="srl-dialog__close srl-button srl-button--icon"
        :title="$t('modalClose')"
        :aria-label="$t('modalClose')"
        @click="close"
      >
        <i class="srl-icon-close" aria-hidden="true" />
      </button>
    </header>
    <main class="srl-dialog__main srl-article-root" tabindex="-1">
      <VRuntimeTemplate v-if="props.content !== ''" :template="props.content" />
      <slot name="main"/>
    </main>
    <footer v-if="$slots.footer" class="srl-dialog__footer">
      <slot name="footer"/>
    </footer>
  </div>
</template>

<style lang="scss">
@use "@/assets/scss/components/dialog";
</style>
