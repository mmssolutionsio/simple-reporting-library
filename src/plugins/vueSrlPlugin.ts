import { defineComponent, defineAsyncComponent } from 'vue'
import SrlAriaTabChain from '../components/Srl/Aria/TabChain.vue'
import SrlArticleAutoload from '../components/Srl/Article/Autoload.vue'
import SrlArticleRoot from '../components/Srl/Article/Root.vue'
import SrlMenu from '../components/Srl/Menu/List.vue'
import asyncLddComponent from "#imports/asyncLddComponent";

export default {
  install(app) {
    app.component('SrlAriaTabChain', defineComponent(SrlAriaTabChain))
    app.component('SrlArticleAutoload', defineComponent(SrlArticleAutoload))
    app.component('SrlArticleRoot', defineComponent(SrlArticleRoot))
    app.component('SrlMenu', defineComponent(SrlMenu))
    asyncLddComponent(app)
  }
}