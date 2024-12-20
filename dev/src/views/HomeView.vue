<script setup lang="ts">
import { computed } from 'vue'
import { ArrayToString } from '@/utils/variables'
import { useRoute } from 'vue-router'

const route = useRoute()

const locale = computed<string>(() => {
  return ArrayToString(route.params.locale)
})
</script>

<template>
  <div class="srl-main">
    <h1>Welcome {{ locale }}</h1>
    <h3>Dokumentation Frontend Toolkit für Komponenten als auch APP:</h3>
    <p>
      <a href="https://mmssolutionsio.github.io/mms-reporting-docs/docs/intro" target="_blank"
        >Dokumentation</a
      >
    </p>
  </div>
</template>

<style scoped lang="scss">
@use 'nswow';

.srl-main {
  padding: nswow.system-size-unit(100) 0;
  margin-left: auto;
  margin-right: auto;
  min-height: 80vh;
  @include nswow.grid-container();
}
</style>
