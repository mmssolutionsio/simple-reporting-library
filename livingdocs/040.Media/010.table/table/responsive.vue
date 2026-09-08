<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    component?: HTMLDivElement;
    containerSelector?: string;
    tableSelector?: string;
  }>(),
  {
    containerSelector: '.srl-table__container',
    tableSelector: 'table',
  },
);

const component = ref<HTMLDivElement>();
const classTarget = ref<HTMLElement>();
const table = ref<HTMLTableElement>();
const container = ref<HTMLDivElement>();

watch(props, (to) => {
  !to.component || init(to.component);
});

function init(componentEl: HTMLDivElement | undefined) {
  if (!componentEl) return;
  component.value = componentEl;
  classTarget.value = componentEl.parentElement ?? componentEl;
  classTarget.value.classList.remove(
    'has-shadow',
    'responsive-table',
    'responsive-table-alternative',
    'has-alternative-shadow-left',
    'has-alternative-shadow-right',
  );
  table.value = componentEl.querySelector(
    props.tableSelector,
  ) as HTMLTableElement;
  const containerRoot = componentEl.querySelector(
    props.containerSelector,
  ) as HTMLDivElement;
  container.value =
    (containerRoot?.querySelector('.srl-table-container') as HTMLDivElement) ??
    containerRoot;
  updateClasses();
  enableDragScroll();
  window.addEventListener('resize', updateClasses);
}

defineExpose({
  init,
});

function hasHorizontalScrollbar(): boolean {
  return !table.value || !container.value
    ? false
    : table.value?.clientWidth > container.value?.clientWidth;
}

function hasRowSpan() {
  if (!table.value) return false;
  const tableCells = table.value.querySelectorAll('td[rowspan]');
  return tableCells.length > 0;
}

function updateClasses() {
  const hasScroll = hasHorizontalScrollbar();
  const hasRowspan = hasRowSpan();
  const target = classTarget.value;

  if (hasScroll && !hasRowspan) {
    target?.classList.add('has-shadow', 'responsive-table');
    target?.classList.remove(
      'responsive-table-alternative',
      'has-alternative-shadow-left',
      'has-alternative-shadow-right',
    );
  } else if (hasScroll && hasRowspan) {
    target?.classList.add('responsive-table-alternative');
    target?.classList.remove('has-shadow', 'responsive-table');
    updateAlternativeShadowClasses();
  } else {
    target?.classList.remove(
      'has-shadow',
      'responsive-table',
      'responsive-table-alternative',
      'has-alternative-shadow-left',
      'has-alternative-shadow-right',
    );
  }
}

function updateAlternativeShadowClasses() {
  const target = classTarget.value;
  const containerEl = container.value;

  if (
    !target ||
    !containerEl ||
    !target.classList.contains('responsive-table-alternative')
  ) {
    target?.classList.remove(
      'has-alternative-shadow-left',
      'has-alternative-shadow-right',
    );
    return;
  }

  const tolerance = 1;
  const maxScrollLeft = containerEl.scrollWidth - containerEl.clientWidth;
  target.classList.toggle(
    'has-alternative-shadow-left',
    containerEl.scrollLeft > tolerance,
  );
  target.classList.toggle(
    'has-alternative-shadow-right',
    containerEl.scrollLeft < maxScrollLeft - tolerance,
  );
}

function enableDragScroll() {
  let isDragging: boolean = false;
  let startX: number = 0;
  let scrollLeft: number = 0;

  if (container.value) {
    container.value.addEventListener('scroll', updateAlternativeShadowClasses, {
      passive: true,
    });

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

<template></template>
