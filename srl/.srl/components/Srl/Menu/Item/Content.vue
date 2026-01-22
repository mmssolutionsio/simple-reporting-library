<script setup lang="ts">

const props = defineProps<{
  item: NsWowNavigationItem
  depth: number
  disableClasses: boolean
}>();
</script>

<template>
  <SrlMenuItemContentIcon
    v-if="props.item.icon"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <SrlMenuItemContentIconBefore
    v-else-if="props.item.iconBefore"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <SrlMenuItemContentIconAfter
    v-else-if="props.item.iconAfter"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <SrlMenuItemContentImage
    v-else-if="props.item.img"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <SrlMenuItemContentImageBefore
    v-else-if="props.item.imgBefore"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <SrlMenuItemContentImageAfter
    v-else-if="props.item.imgAfter"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <SrlMenuItemContentSvg
    v-else-if="props.item.svg"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <SrlMenuItemContentSvgBefore
    v-else-if="props.item.svgBefore"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <SrlMenuItemContentSvgAfter
    v-else-if="props.item.svgAfter"
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
  <SrlMenuItemContentText
    v-else
    :item="props.item"
    :depth="props.depth"
    :disableClasses="props.disableClasses"
  />
</template>
