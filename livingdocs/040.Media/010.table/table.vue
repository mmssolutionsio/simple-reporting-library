<script setup lang="ts">
const props = withDefaults(defineProps<{
  responsive?: boolean
  download?: boolean
}>(), {
  responsive: false,
  download: false,
})

import { ref } from 'vue'
import TableResponsive from './table/responsive.vue'
import TableDownload from './table/download.vue'

const component = ref<HTMLDivElement>()
</script>

<template>
  <div ref="component">
    <TableResponsive v-if="props.responsive" :component="component" />
    <slot/>
    <div v-if="props.download" class="srl-table__download">
      <TableDownload :component="component" />
    </div>
  </div>
</template>