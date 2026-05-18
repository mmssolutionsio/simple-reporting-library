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
  padding-top: calc( srl.system-root-style(srl-header-height) + srl.spacer-get(800) );
  min-height: 100dvh;
  &:has(.srl-article-root [class*='hero']:first-child),
  &:has(.srl-article-root [class*='background']:first-child)
  {
    padding-top: srl.system-root-style(srl-header-height);
  }
}
</style>