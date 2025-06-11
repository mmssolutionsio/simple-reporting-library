<script setup lang="ts">
import PrevNext from '@/components/PrevNext.vue'
const props = defineProps<{
  mainNavigation: NsWowNavigationItem[]
}>()
</script>

<template>
  <PrevNext :mainNavigation="props.mainNavigation">
    <SrlArticleRoot />
  </PrevNext>
</template>
