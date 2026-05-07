<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = withDefaults(defineProps<{
  rootSelector?: string
  highlightClass?: string
  queryParam?: string
}>(), {
  rootSelector: '#srl-page-main',
  highlightClass: 'searchTarget',
  queryParam: 'searchTarget'
})

const route = useRoute()

let mutationObserver: MutationObserver | null = null
let highlightTimeout: ReturnType<typeof setTimeout> | null = null
let isApplyingHighlight = false
let hasScrolledToHighlight = false

function getRootElement(): HTMLElement | null {
  return document.querySelector(props.rootSelector)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function removeHighlights(root: HTMLElement): void {
  const highlights = root.querySelectorAll(`span.${props.highlightClass}`)

  highlights.forEach((highlight) => {
    const parent = highlight.parentNode
    if (!parent) return

    parent.replaceChild(document.createTextNode(highlight.textContent ?? ''), highlight)
    parent.normalize()
  })
}

function highlightTextNodes(root: HTMLElement, term: string): number {
  const safeTermPattern = escapeRegExp(term)
  const regex = new RegExp(`(${safeTermPattern})`, 'gi')

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement
        if (!parent) return NodeFilter.FILTER_REJECT

        const tag = parent.tagName.toLowerCase()
        if (
          tag === 'script' ||
          tag === 'style' ||
          tag === 'noscript' ||
          tag === 'textarea'
        ) {
          return NodeFilter.FILTER_REJECT
        }

        if (parent.closest(`.${props.highlightClass}`)) {
          return NodeFilter.FILTER_REJECT
        }

        const text = node.textContent
        if (!text || !text.trim()) return NodeFilter.FILTER_SKIP

        regex.lastIndex = 0
        if (!regex.test(text)) return NodeFilter.FILTER_SKIP

        return NodeFilter.FILTER_ACCEPT
      }
    }
  )

  const textNodes: Text[] = []
  let node: Node | null = null

  while ((node = walker.nextNode())) {
    textNodes.push(node as Text)
  }

  let hitCount = 0

  for (const textNode of textNodes) {
    const text = textNode.textContent ?? ''
    regex.lastIndex = 0

    const matches = [...text.matchAll(regex)]
    if (!matches.length) continue

    const fragment = document.createDocumentFragment()
    let lastIndex = 0

    for (const match of matches) {
      const matchText = match[0]
      const index = match.index ?? 0

      if (index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)))
      }

      const span = document.createElement('span')
      span.className = props.highlightClass
      span.textContent = matchText
      fragment.appendChild(span)

      lastIndex = index + matchText.length
      hitCount++
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)))
    }

    textNode.parentNode?.replaceChild(fragment, textNode)
  }

  return hitCount
}

function scrollToFirstHighlight(root: HTMLElement): void {
  const firstHighlight = root.querySelector<HTMLElement>(`.${props.highlightClass}`)
  if (!firstHighlight) return

  firstHighlight.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest'
  })
}

function stopObserver(): void {
  mutationObserver?.disconnect()
}

function startObserver(): void {
  const root = getRootElement()
  if (!root) return

  stopObserver()

  mutationObserver = new MutationObserver(() => {
    if (isApplyingHighlight) return
    scheduleHighlight()
  })

  mutationObserver.observe(root, {
    childList: true,
    subtree: true,
    characterData: true
  })
}

function scheduleHighlight(): void {
  if (highlightTimeout) {
    clearTimeout(highlightTimeout)
  }

  highlightTimeout = setTimeout(() => {
    void applySearchHighlight()
  }, 0)
}

async function applySearchHighlight(): Promise<void> {
  const root = getRootElement()
  if (!root || isApplyingHighlight) return

  const rawSearchTarget = route.query[props.queryParam]
  const searchTarget =
    typeof rawSearchTarget === 'string'
      ? decodeURIComponent(rawSearchTarget).trim()
      : ''

  isApplyingHighlight = true
  stopObserver()

  try {
    removeHighlights(root)

    if (!searchTarget) {
      hasScrolledToHighlight = false
      return
    }

    await nextTick()

    const hitCount = highlightTextNodes(root, searchTarget)

    if (hitCount > 0 && !hasScrolledToHighlight) {
      await nextTick()
      scrollToFirstHighlight(root)
      hasScrolledToHighlight = true
    }
  } finally {
    isApplyingHighlight = false
    startObserver()
  }
}

onMounted(async () => {
  await nextTick()
  startObserver()
  await applySearchHighlight()
})

watch(
  () => route.fullPath,
  async () => {
    hasScrolledToHighlight = false
    await nextTick()
    scheduleHighlight()
  }
)

watch(
  () => props.rootSelector,
  async () => {
    hasScrolledToHighlight = false
    await nextTick()
    startObserver()
    scheduleHighlight()
  }
)

onBeforeUnmount(() => {
  stopObserver()

  if (highlightTimeout) {
    clearTimeout(highlightTimeout)
  }
})
</script>

<template />

<style lang="scss">
@use "srl";
.searchTarget {
  background-color: srl.colors-primary-1000();
  color: srl.colors-white-1000();
  padding: srl.spacer-get(50);
  text-box-trim: trim-both;
  border-radius: srl.spacer-get(50);
}
</style>