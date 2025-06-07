<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue';
import PageFooter from '@/components/PageFooter.vue'
import MainNavigation from '@/components/MainNavigation.vue'
import useMenu from '#composables/menu.ts'
import PageKeyboardPointer from '@/components/PageKeyboardPointer.vue';

const mainNavigation = useMenu('menuMain')
</script>

<template>
  <PageKeyboardPointer/>
  <PageHeader />
  <MainNavigation :mainNavigation="mainNavigation" />
  <PageMain :mainNavigation="mainNavigation" />
  <PageFooter />
</template>
