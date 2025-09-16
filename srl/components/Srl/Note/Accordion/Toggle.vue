<script setup lang="ts">
const props = defineProps<{
  accordion: {
    id: string;
    state: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
  };
}>()

</script>

<template>
  <button
    type="button"
    :aria-expanded="props.accordion.state"
    :aria-controls="props.accordion.id"
    @click="props.accordion.toggle()"
  >
    <slot/>
  </button>
</template>