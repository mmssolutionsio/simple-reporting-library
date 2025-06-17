import { defineAsyncComponent } from 'vue'
export default function asyncLdComponent(app) {
 app.component('SrlArticleTable', defineAsyncComponent(() => import('#ld/Media/table/table.vue')))
}