<script setup lang="ts">
import { ref } from 'vue';
import SrlPageCustomDialog from '@/Dialog.vue';
import Autoload from '@/Autoload.ts';

const props = withDefaults(
  defineProps<{
    header?: string;
    content?: string;
  }>(),
  {
    header: '',
    content: '',
  },
);

const $el = ref<HTMLDialogElement | null>(null);
const dialogState = ref<boolean>(false);

const header = ref<string>(props.header);
const content = ref<string>(props.content);

function setDialogContent(template: string) {
  content.value = template;
}

function setDialogContentAndOpen(template: string) {
  setDialogContent(template);
  open();
}

function open() {
  $el.value?.showModal();
  dialogState.value = true;
  $el.value?.querySelector('.srl-dialog__main')?.focus();
  Autoload.init($el.value);
}

function close() {
  $el.value?.close();
  dialogState.value = false;
}

function clearContent() {
  header.value = '';
  content.value = '';
}

defineExpose({
  $el,
  dialogState,
  setDialogContent,
  setDialogContentAndOpen,
  open,
  close,
});
</script>

<template>
  <dialog
    ref="$el"
    id="srl-page__dialog"
    class="srl-page__dialog"
    aria-modal="true"
    @click.stop="close"
  >
    <SrlAriaTabChain @click.stop>
      <SrlPageCustomDialog :header="header" :content="content" @close="close" />
    </SrlAriaTabChain>
  </dialog>
</template>
