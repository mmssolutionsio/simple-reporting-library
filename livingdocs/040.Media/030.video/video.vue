<script setup lang="ts">
import { onMounted, ref, useId } from 'vue'

const id = useId()
const rootEl = ref<HTMLDivElement>()
const button = ref<HTMLButtonElement>()
const video = ref<HTMLVideoElement>()

onMounted(() => {
  video.value = rootEl.value?.querySelector('video') || undefined
  if (video.value) {
    video.value.id = id
    video.value.playsInline = true
    video.value.controls = true
    video.value.tabIndex = -1
    button.value = rootEl.value?.querySelector('button') || undefined
    if (button.value) {
      const label = button.value.textContent || 'Play Video'
      button.value.setAttribute('aria-label', label)
      button.value.setAttribute('title', label)
      button.value.setAttribute('aria-controls', id)
      button.value.addEventListener('click', () => {
        rootEl.value?.classList.add('srl-video__started')
        if (video.value) {
          video.value.tabIndex = 0
        }

        if (button.value) {
          button.value.setAttribute('aria-hidden', 'true')
          button.value.setAttribute('tabindex', '-1')
        }

        const thumbnail = rootEl.value?.querySelector('.srl-video__thumbnail') as HTMLImageElement
        if (thumbnail) {
          thumbnail.ariaHidden = 'true'
        }
        video.value?.focus()
        video.value?.play()
      })
    }
  }
})
</script>

<template>
  <div ref="rootEl">
    <slot/>
  </div>
</template>

<style scoped lang="scss">

</style>