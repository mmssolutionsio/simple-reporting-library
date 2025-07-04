<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import Autoload from '@/Autoload.ts'
import { useRoute } from 'vue-router'

const articleRoot = ref<HTMLDivElement | null>(null)

const route = useRoute()

onMounted(() => {
  nextTick(() => {
    Autoload.init(articleRoot.value)
    if (route.hash) {
      const target = document.querySelector(route.hash)
      if (target) {
        target.scrollIntoView({ behavior: 'instant', block: 'start' })
      }
    }
  })
})
</script>

<template>
  <article ref="articleRoot" class="srl-article-root"></article>
</template>
