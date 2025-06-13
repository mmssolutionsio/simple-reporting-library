<script setup>
import { ref } from 'vue'
import SvgDropdown from './theme/SvgDropdown.vue'

const props = defineProps({
  categories: Array,
  activeCategories: Array,
  updateCategories: Function
})

const open = ref(false)

function toggleCategory(index) {
  if (props.activeCategories.includes(index)) {
    props.updateCategories(props.activeCategories.filter((ac) => ac !== null && ac != index))
  } else {
    props.updateCategories(
      [...props.activeCategories, index].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    )
  }
}

function toggleState() {
  open.value = !open.value
}

function closeDropdown() {
  open.value = false
}
</script>
<template>
  <div
    class="iz-kfc-dropdown iz-kfc-dropdown--periods"
    :class="{ open: open }"
    @blur="closeDropdown()"
    tabindex="-1"
  >
    <div class="iz-kfc-dropdown__title srl-typo-headline3" @click="toggleState()">
      <span>{{ $t('kfc-dropdown.periods.title') }}</span>
      <SvgDropdown></SvgDropdown>
    </div>
    <div class="iz-kfc-dropdown__list" id="dropdown-content-timeperiods" v-if="open">
      <div
        class="iz-kfc-dropdown__item iz-kfc-dropdown__item--period"
        v-for="(category, index) in props.categories"
        :class="{ active: props.activeCategories.includes(index) }"
        @click="toggleCategory(index)"
        v-bind:key="index"
      >
        <span class="indicator">
          <svg
            version="1.1"
            id="select-x"
            xmlns="http://www.w3.org/2000/svg"
            x="0"
            y="0"
            viewBox="0 0 13 13"
            style="enable-background: new 0 0 13 13"
            xml:space="preserve"
          >
            <g id="Desktop">
              <g id="Desktop_Mehrjahresvergleich_Menu_1" transform="translate(-329 -980)">
                <g id="Group-5-Copy-5" transform="translate(330 981)">
                  <path
                    id="Stroke-1"
                    class="st0"
                    style="fill: none; stroke: #000; stroke-width: 0.9231"
                    d="m-.5-.5 12 12"
                  />
                  <path
                    id="Stroke-3"
                    style="fill: none; stroke: #000; stroke-width: 0.9231"
                    class="st0"
                    d="m11.5-.5-12 12"
                  />
                </g>
              </g>
            </g>
          </svg>
        </span>
        <span>{{ category }}</span>
      </div>
    </div>
  </div>
</template>
