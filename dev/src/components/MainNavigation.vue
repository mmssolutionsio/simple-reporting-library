<script lang="ts" setup>
const props = defineProps<{
  mainNavigation: NsWowNavigationItem[]
}>()
</script>

<template>
  <nav id="srl-page__navigation" class="srl-navigation" tabindex="-1">
    <SrlMenu
      name="main-navigation"
      :menu="props.mainNavigation"
      class="srl-main-navigation"
    />
  </nav>
</template>

<style lang="scss">
@use 'nswow';
</style>
