<script setup lang="ts">
import { ref } from 'vue'
import TableResponsive from './table/responsive.vue'
import TableDownload from './table/download.vue'

const component = ref<HTMLDivElement>()
</script>

<template>
  <div ref="component">
    <TableResponsive :component="component" />
    <slot/>
  </div>
</template>