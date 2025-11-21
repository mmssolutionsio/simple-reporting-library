<script setup lang="ts">
import { ref, useId } from 'vue'
import { useArticles, useConfig } from '#composables';
import { prepareHtmlContent, isDialogStored, addDialogToStorage, getDialogFromStorage } from '#utils';

const props = defineProps<{
  uuid: string;
  anchor?: string;
}>();

const config = useConfig();
const articles = useArticles();
const id = ref<string>(`srl-page__dialog-${useId()}`);
const content = ref<string>('');
const dialog = ref<SrlPageDialog | null>(null);
let dialogStored = false

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

if (isDialogStored(props.uuid)) {
  dialogStored = true;
} else {
  addDialogToStorage(props.uuid, dialog);
  loadContent();
}

async function open() {
  if (dialog.value) {
    dialog.value.open();
  } else {
    const storage = getDialogFromStorage(props.uuid);
    storage ?
        storage.open():
        console.warn(`Dialog with uuid ${props.uuid} not found in storage.`);
  }
}
</script>

<template>
  <button
      class="srl-dialog-button"
      type="button"
      :aria-controls="id"
      aria-haspopup="dialog"
      :aria-expanded="dialog?.dialogState ?? false"
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
