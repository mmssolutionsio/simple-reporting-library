<script setup lang="ts">
import { useSlots, ref, h, computed, Fragment, type VNodeArrayChildren } from 'vue'

const props = defineProps<{
  id?: string
}>()

const slots = useSlots()
const headerSlot = slots.header ? slots.header() : null
const header = ref<VNodeArrayChildren | null>(null)
const level = ref(0)

if (
  headerSlot
  && headerSlot[0]
  && headerSlot[0].type
  && headerSlot[0].children
) {
  const match = String(headerSlot[0].type).match(/^h([1-6])$/i)
  if (match) {
    level.value = parseInt(match[1]) - 2
    header.value = headerSlot[0].children
  }
}

const renderedHeader = computed(() => {
  if (!header.value) return []
  const res = []
  if (header.value[0].props.class.includes('__number-text-container')) {
    header.value[0].children.forEach((item) => {
      if (item.props.class.includes('__number')) {
        item.props = {
          class: 'srl-category-accordion__head-number'
        }
        res.push(h(Fragment, null, item as VNodeArrayChildren))
      } else if (item.props.class.includes('__text')) {
        item.props = {
          class: 'srl-category-accordion__head-text'
        }
        res.push(h(Fragment, null, item as VNodeArrayChildren))
      }
    })
  } else {
    header.value[0].props = {
      class: 'srl-category-accordion__head-text'
    }
    res.push(h(Fragment, null, header.value[0] as VNodeArrayChildren))
  }

  return res
})
</script>

<template>
  <template v-if="renderedHeader.length">
    <srl-category-accordion
      v-slot="{ accordion }"
      class="srl-category-accordion srl-category-accordion--category"
      :class="`srl-category-accordion--level-${level}`"
      :id="props.id"
    >
      <div class="srl-category-accordion__inner">
        <div class="srl-category-accordion__inner-head">
          <srl-category-accordion-toggle :accordion="accordion" class="srl-category-accordion__head" :level="level">
            <template v-for="item in renderedHeader">
              <component :is="item" />
            </template>
            <span class="srl-category-accordion__icon"></span>
          </srl-category-accordion-toggle>
        </div>
        <srl-category-accordion-content :accordion="accordion" class="srl-category-accordion__content">
          <div class="srl-category-accordion__content-inner">
            <slot name="content"/>
          </div>
        </srl-category-accordion-content>
      </div>
    </srl-category-accordion>
  </template>
  <template v-else>
    <slot name="header"/>
    <slot name="content"/>
  </template>
</template>
