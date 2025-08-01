<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import PageFooter from '@/components/PageFooter.vue'
import MainNavigation from '@/components/MainNavigation.vue'
import BypassLinks from '@/components/BypassLinks.vue'
import { useMenu } from '#composables'

const mainNavigation = useMenu('menuMain')
</script>

<template>
  <div class="srl-page__wrap">
    <BypassLinks />
    <PageHeader />
    <MainNavigation :mainNavigation="mainNavigation" />
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
