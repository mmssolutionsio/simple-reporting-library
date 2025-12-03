<script setup lang="ts">
import { computed, ref } from 'vue'
import { useArticles, useConfig } from '#composables';
import { prepareHtmlContent, isDialogStored, addDialogToStorage, getDialogFromStorage } from '#utils';

const props = defineProps<{
  uuid: string;
  anchor?: string;
}>();

const config = useConfig();
const articles = useArticles();
const id = ref<string>(`srl-page__dialog-${props.uuid.replaceAll(' ', '_')}`);
const content = ref<string>('');

const dialog = isDialogStored(props.uuid)?
    getDialogFromStorage(props.uuid):
    ref<SrlPageDialog | null>(null);

if (!isDialogStored(props.uuid)) {
  addDialogToStorage(props.uuid, dialog);
  loadContent();
}

const state = computed<boolean>(() => {
  return dialog.value ?
      dialog.value.dialogState : false
});

async function loadContent() {
  const article = articles.value.find((article) => article.uuid === props.uuid);
  if (article) {
    const file = `./html/${config.value.locale}/${article.name}.html`;
    try {
      const req = await fetch(file);
      const text = await req.text();
      content.value = prepareHtmlContent(text);
      // Do something with anchor if provided
      /*
      if (props.anchor) {
        nextTick(() => {
          // Do action
        });
      }
       */
    } catch (error) {
      console.error(`Failed to load article content from ${file}:`, error);
    }
  }
}

async function open() {
  dialog.value?.open();
}
</script>

<template>
  <button
      class="srl-dialog-button"
      type="button"
      :aria-controls="id"
      aria-haspopup="dialog"
      :aria-expanded="state"
      @click="open"
  >
    <slot />
    <Teleport v-if="content" to="body">
      <SrlPageDialog
          :id="id"
          ref="dialog"
          :content="content"
          @close="expanded = false"
      />
    </Teleport>
  </button>
</template>
