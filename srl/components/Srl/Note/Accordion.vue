<script setup lang="ts">
import { ref, useId } from 'vue'

const id = ref(useId())
const accordion = ref<HTMLDivElement>()
const open = ref(false)

function toggle() {
  open.value = !open.value
}
</script>

<template>
  <div class="srl-note-accordion" ref="accordion">
    <slot :id="id" :open="open" :toggle="toggle"/>
  </div>
</template>