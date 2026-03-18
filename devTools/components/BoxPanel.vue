<script setup lang="ts">
import { NH2, NText } from "naive-ui"
const props = defineProps({
  label: String
})
</script>

<template>
  <div class="srl-dev-tools__box-panel">
    <NText v-text="props.label"/>
    <div>
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.srl-dev-tools__box-panel {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
</style>