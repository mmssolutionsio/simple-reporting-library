import { defineComponent, type App } from 'vue';
import SrlAriaTabChain from '#components/Srl/Aria/TabChain.vue';
import SrlArticleAutoload from '#components/Srl/Article/Autoload.vue';
import SrlArticleRoot from '#components/Srl/Article/Root.vue';
import SrlArticleDialogButton from '#components/Srl/Article/DialogButton.vue';
import SrlMenu from '#components/Srl/Menu/List.vue';
import SrlPageDialog from '#components/Srl/Page/Dialog.vue';
import asyncLdComponent from './asyncLdComponent.ts';

export default {
  install(app: App) {
    app.component('SrlAriaTabChain', defineComponent(SrlAriaTabChain));
    app.component('SrlArticleAutoload', defineComponent(SrlArticleAutoload));
    app.component('SrlArticleRoot', defineComponent(SrlArticleRoot));
    app.component(
      'SrlArticleDialogButton',
      defineComponent(SrlArticleDialogButton),
    );
    app.component('SrlPageDialog', defineComponent(SrlPageDialog));
    app.component('SrlMenu', defineComponent(SrlMenu));
    asyncLdComponent(app);
  },
};
