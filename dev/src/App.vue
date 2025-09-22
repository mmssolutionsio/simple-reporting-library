<script setup lang="ts">
import { useMenu } from '#composables'

const mainNavigation = useMenu('menuMain')
</script>

<template>
  <div class="srl-page__wrap">
    <PageBypassLinks />
    <PageHeader />
    <PageMainNavigation :mainNavigation="mainNavigation" />
    <PageMain :mainNavigation="mainNavigation" />
    <PageFooter />
  </div>
</template>

<style lang="scss">
@use 'srl';
.srl-page__wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  #srl-page-main {
    flex: 1 1 auto;
  }
}
</style>
