<script setup lang="ts">
import { ref } from 'vue'
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
const header = ref<string>(props.header);
const content = ref<string>(props.content);
const dialogState = ref<boolean>(false);
function setDialogContent(template: string) {
  content.value = template;
}

function setDialogContentAndOpen(template: string) {
  setDialogContent(template);
  open();
}

function open() {
  dialogState.value = true;
  const dialog = $el.value as HTMLDialogElement;
  dialog.showModal();
  const main = dialog.querySelector('.srl-dialog__main') as HTMLElement;
  main ? main.focus() : null
  Autoload.init(dialog);
}

function close() {
  dialogState.value = false;
  const dialog = $el.value as HTMLDialogElement;
  dialog.close();
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
  clearContent,
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
      <SrlPageCustomDialog :header="header" :content="content" @close="close">
        <template v-if="$slots.header" #header>
          <slot name="header"/>
        </template>
        <template v-if="$slots.main" #main>
          <slot name="main"/>
        </template>
        <template v-else-if="$slots.default" #main>
          <slot/>
        </template>
        <template v-if="$slots.footer" #footer>
          <slot name="footer"/>
        </template>
      </SrlPageCustomDialog>
    </SrlAriaTabChain>
  </dialog>
</template>
