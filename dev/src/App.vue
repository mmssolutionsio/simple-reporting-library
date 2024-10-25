<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import PageFooter from '@/components/PageFooter.vue'
import MainNavigation from '@/components/MainNavigation.vue'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrayToString } from '@/utils/variables'
import PageModal from '@/components/PageModal.vue'

const route = useRoute()
const { locale } = useI18n()
const modal = ref()

async function modalContent(html: string) {
  await modal.value.setContent(html)
}

defineExpose({
  modalContent
})

watch(route, () => {
  const paramLocale = ArrayToString(route.params.locale)
  if (paramLocale !== locale.value) {
    locale.value = paramLocale
  }
})
</script>

<template>
  <PageHeader />
  <suspense>
    <MainNavigation />
  </suspense>
  <suspense>
    <RouterView />
  </suspense>
  <suspense>
    <PageFooter />
  </suspense>
  <PageModal ref="modal" />
</template>
