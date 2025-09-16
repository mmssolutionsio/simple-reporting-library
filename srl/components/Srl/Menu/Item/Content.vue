<script setup lang="ts">
import MenuItemContentText from './Content/Text.vue';
import MenuItemContentImage from './Content/Image.vue';
import MenuItemContentImageBefore from './Content/ImageBefore.vue';
import MenuItemContentImageAfter from './Content/ImageAfter.vue';
import MenuItemContentIcon from './Content/Icon.vue';
import MenuItemContentIconBefore from './Content/IconBefore.vue';
import MenuItemContentIconAfter from './Content/IconAfter.vue';

const props = defineProps<{
  item: NsWowNavigationItem
  depth: number
  disableClasses: boolean
}>();
</script>

<template>
  <MenuItemContentIcon
    v-if="props.item.icon"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <MenuItemContentIconBefore
    v-else-if="props.item.iconBefore"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <MenuItemContentIconAfter
    v-else-if="props.item.iconAfter"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <MenuItemContentImage
    v-else-if="props.item.img"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <MenuItemContentImageBefore
    v-else-if="props.item.imgBefore"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <MenuItemContentImageAfter
    v-else-if="props.item.imgAfter"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <MenuItemContentText
    v-else
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
</template>
