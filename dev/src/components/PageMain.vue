<script setup lang="ts">
const props = defineProps<{
  mainNavigation: NsWowNavigationItem[]
}>()
</script>

<template>
  <main id="srl-page__main" tabindex="-1">
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.fullPath" :mainNavigation="props.mainNavigation" />
    </RouterView>
  </main>
</template>
