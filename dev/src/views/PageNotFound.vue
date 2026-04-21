<script setup lang="ts">
const props = defineProps<{
  mainNavigation: NsWowNavigationItem[]
}>()
</script>

<template>
  <PagePrevNext :mainNavigation="props.mainNavigation">
    <SrlArticleRoot />
  </PagePrevNext>
</template>
