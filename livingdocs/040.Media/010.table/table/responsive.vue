<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  component?: HTMLDivElement
  containerSelector?: string
  tableSelector?: string
}>(), {
  containerSelector: '.srl-table__container',
  tableSelector: 'table'
})

const component = ref<HTMLDivElement>()
const table = ref<HTMLTableElement>()
const container = ref<HTMLDivElement>()

watch(
  props,
  to => {
    !to.component || init(to.component)
  }
)

function init(componentEl: HTMLDivElement | undefined) {
  if (!componentEl) return
  component.value = componentEl
  table.value = componentEl.querySelector(props.tableSelector) as HTMLTableElement
  container.value = componentEl.querySelector(props.containerSelector) as HTMLDivElement
  updateClasses()
  enableDragScroll()
  window.addEventListener('resize', updateClasses)
}

defineExpose({
  init
})

function hasHorizontalScrollbar(): boolean {
  return !table.value || !container.value ?
    false :
    table.value?.clientWidth > container.value?.clientWidth
}

function hasRowSpan() {
  if (!table.value) return false
  const tableCells = table.value.querySelectorAll('td[rowspan]')
  return tableCells.length > 0
}

function updateClasses() {
  const hasScroll = hasHorizontalScrollbar()
  const hasRowspan = hasRowSpan()
  if (hasScroll && !hasRowspan) {
    component.value?.classList.add('has-shadow', 'responsive-table')
    component.value?.classList.remove('responsive-table-alternative')
  } else if (hasScroll && hasRowspan) {
    component.value?.classList.add('responsive-table-alternative')
    component.value?.classList.remove('has-shadow', 'responsive-table')
  } else {
    component.value?.classList.remove('has-shadow', 'responsive-table', 'responsive-table-alternative')
  }
}

function   enableDragScroll() {
  let isDragging: boolean = false;
  let startX: number = 0;
  let scrollLeft: number = 0;

  if (container.value) {
    container.value.addEventListener('mousedown', (e) => {
      if (container.value) {
        isDragging = true;
        startX = e.pageX - container.value.offsetLeft;
        scrollLeft = container.value.scrollLeft;
        container.value.classList.add('dragging');
      }
    });

    container.value.addEventListener('mousemove', (e) => {
      if (container.value) {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - container.value.offsetLeft;
        const walk = (x - startX) * 2; // Adjust speed
        container.value.scrollLeft = scrollLeft - walk;
      }
    });

    container.value.addEventListener('mouseup', () => {
      isDragging = false;
      container.value?.classList.remove('dragging');
    });

    container.value.addEventListener('mouseleave', () => {
      isDragging = false;
      container.value?.classList.remove('dragging');
    });
  }
}
</script>

<template>
</template>