<script setup lang="ts">
const props = defineProps<{
  mainNavigation: NsWowNavigationItem[]
}>()
</script>

<template>
  <main id="srl-page-main" tabindex="-1">
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.fullPath" :mainNavigation="props.mainNavigation" />
    </RouterView>
  </main>
</template>

<style lang="scss" scoped>
@use 'srl';
#srl-page-main {
  padding-top: srl.system-root-style(srl-header-height);
  min-height: 100dvh;
  .srl-page__wrap:not([class*='home']) & {
    padding-top: calc( srl.system-root-style(srl-header-height) + srl.spacer-get(800) );
  }
}
</style>