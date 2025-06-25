<script setup lang="ts">
import { ref, useId } from 'vue';
import { useArticles, useConfig } from '#composables';

const props = defineProps<{
  uuid: string;
}>();

const config = useConfig();
const articles = useArticles();
const id = ref<string>(`srl-page__dialog-${useId()}`);
const content = ref<string>('');
const dialog = ref<typeof SrlPageDialog | null>(null);
async function loadContent() {
  const article = articles.value.find((article) => article.uuid === props.uuid);
  if (article) {
    const file = `./html/${config.value.locale}/${article.name}.html`;
    try {
      const req = await fetch(file);
      const text = await req.text();
      content.value = text;
    } catch (error) {
      console.error(`Failed to load article content from ${file}:`, error);
    }
  }
}

loadContent();
async function open() {
  dialog.value.open();
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
    <Teleport to="body">
      <SrlPageDialog
        v-if="content"
        :id="id"
        ref="dialog"
        :content="content"
        @close="expanded = false"
      />
    </Teleport>
  </button>
</template>
