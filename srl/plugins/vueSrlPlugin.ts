import { App } from 'vue';
import SrlAriaTabChain from '../components/Srl/Aria/TabChain.vue';
import SrlArticleAutoload from '../components/Srl/Article/Autoload.vue';
import SrlArticleRoot from '../components/Srl/Article/Root.vue';
import SrlArticleDialogButton from '../components/Srl/Article/DialogButton.vue';
import SrlMenu from '../components/Srl/Menu/List.vue';
import SrlPageDialog from '../components/Srl/Page/Dialog.vue';
import asyncLdComponent from './asyncLdComponent.ts';

export default {
  install(app: App) {
    app.component('SrlAriaTabChain', SrlAriaTabChain);
    app.component('SrlArticleAutoload', SrlArticleAutoload);
    app.component('SrlArticleRoot', SrlArticleRoot);
    app.component('SrlArticleDialogButton', SrlArticleDialogButton);
    app.component('SrlPageDialog', SrlPageDialog);
    app.component('SrlMenu', SrlMenu);
    asyncLdComponent(app)
  },
};
