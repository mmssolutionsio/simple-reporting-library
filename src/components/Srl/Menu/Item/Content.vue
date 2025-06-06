<script setup lang="ts">
import MenuItemContentText from './Content/Text.vue'
import MenuItemContentImage from './Content/Image.vue'
import MenuItemContentImageBefore from './Content/ImageBefore.vue'
import MenuItemContentImageAfter from './Content/ImageAfter.vue'

const props = defineProps<{
  item: NsWowNavigationItem
}>()
</script>

<template>
  <MenuItemContentImage v-if="props.item.img" :item="props.item" />
  <MenuItemContentImageBefore v-else-if="props.item.imgBefore" :item="props.item" />
  <MenuItemContentImageAfter v-else-if="props.item.imgAfter" :item="props.item" />
  <MenuItemContentText v-else :item="props.item" />
</template>