<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  accordion: {
    id: string;
    state: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
  }
  level: number
}>()

const headingLevel = computed(() => Math.min(Math.max(props.level + 2, 2), 6))
const headingTag = computed(() => `h${headingLevel.value}`)
const headingClass = computed(() => `srl-title-h${headingLevel.value}`)

</script>

<template>
  <component :is="headingTag" :class="headingClass">
    <button
      type="button"
      class="srl-category-accordion__head--btn"
      :aria-expanded="props.accordion.state"
      :aria-controls="props.accordion.id"
      @click="props.accordion.toggle()"
    >
      <slot/>
    </button>
  </component>
</template>