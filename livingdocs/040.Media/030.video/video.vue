<script setup lang="ts">
import { onMounted, ref, useId } from 'vue'

const id = useId()
const rootEl = ref<HTMLDivElement>()
const button = ref<HTMLButtonElement | null>(null)
const thumbnail = ref<HTMLImageElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)
const iframe = ref<HTMLIFrameElement | null>(null)
const iframeSrc = ref<string | null>(null)

onMounted(() => {
  button.value = rootEl.value?.querySelector('button') || null
  if (button.value) {
    const buttonEl = button.value as HTMLButtonElement
    const label = buttonEl.textContent || 'Play Video'
    buttonEl.setAttribute('aria-label', label)
    buttonEl.setAttribute('title', label)
    buttonEl.setAttribute('aria-controls', id)
  }

  thumbnail.value = rootEl.value?.querySelector('.srl-video__thumbnail') || null

  video.value = rootEl.value?.querySelector('video') || null
  if (video.value) {
    const videoEl = video.value as HTMLVideoElement
    videoEl.id = id
    videoEl.playsInline = true
    videoEl.controls = true
    videoEl.tabIndex = -1
  }

  iframe.value = rootEl.value?.querySelector('iframe') || null
  if (iframe.value) {
    const iframeEl = iframe.value as HTMLIFrameElement
    iframeSrc.value = iframeEl.getAttribute('src')
    iframeEl.removeAttribute('src')
    iframeEl.id = id
    iframeEl.tabIndex = -1
  }

  if (
    button.value
    && thumbnail.value
    && (
      video.value
      || (
        iframe.value
        && iframeSrc.value
      )
    )
  ) {
    const buttonEl = button.value as HTMLButtonElement
    const thumbnailEl = thumbnail.value as HTMLImageElement
    buttonEl.addEventListener('click', () => {
      rootEl.value?.classList.add('srl-video__started')

      buttonEl.setAttribute('aria-hidden', 'true')
      buttonEl.setAttribute('tabindex', '-1')

      if (video.value) {
        const videoEl = video.value as HTMLVideoElement
        videoEl.tabIndex = 0
        videoEl.focus()
        videoEl.play()
      } else if (iframe.value && iframeSrc.value) {
        const iframeEl = iframe.value as HTMLVideoElement
        const iframeSrcString = iframeSrc.value as string
        const seperator = iframeSrcString.includes('?') ? '&' : '?'
        iframeEl.setAttribute(
          'src',
          `${iframeSrcString}${seperator}autoplay=1`
        )
        iframeEl.tabIndex = 0
        iframeEl.focus()
      }

      thumbnailEl.setAttribute('hidden', '')
    })
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