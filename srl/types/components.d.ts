import { Component, App } from 'vue';

interface window {
  app: App;
}
interface _GlobalComponents {
  SrlAriaTabChain: (typeof import('../components/Srl/Aria/TabChain.vue'))['default'];
  SrlArticleAutoload: (typeof import('../components/Srl/Article/Autoload.vue'))['default'];
  SrlArticleDialogButton: (typeof import('../components/Srl/Article/DialogButton.vue'))['default'];
  SrlArticleRoot: (typeof import('../components/Srl/Article/Root.vue'))['default'];
  SrlMenu: (typeof import('../components/Srl/Menu/List.vue'))['default'];
  SrlPageDialog: (typeof import('../components/Srl/Page/Dialog.vue'))['default'];
  SrlNoteAccordion: (typeof import('../components/Srl/Note/Accordion.vue'))['default'];
  SrlNoteAccordionToggle: (typeof import('../components/Srl/Note/Accordion/Toggle.vue'))['default'];
  SrlNoteAccordionContent: (typeof import('../components/Srl/Note/Accordion/Content.vue'))['default'];
}

declare module '@vue/runtime-core' {
  export interface GlobalComponents extends _GlobalComponents {}
}
