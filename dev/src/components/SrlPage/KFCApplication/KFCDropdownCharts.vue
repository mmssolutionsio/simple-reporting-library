<script setup>
import { ref } from 'vue'
import SvgDropdown from './theme/SvgDropdown.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  charts: Array,
  activeSeries: Array,
  activeChart: String,
  updateSeries: Function,
  changeChart: Function
})

const open = ref(false)
const { locale } = useI18n()

function toggleSeries(seriesIndex) {
  if (props.activeSeries.includes(seriesIndex)) {
    props.updateSeries(props.activeSeries.filter((ac) => ac !== null && ac != seriesIndex))
  } else {
    props.updateSeries(
      [...props.activeSeries, seriesIndex].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    )
  }
}

function selectChart(chart) {
  if (chart.id !== props.activeChart) props.changeChart(chart)
}

function toggleState() {
  open.value = !open.value
}

function closeDropdown() {
  open.value = false
}

function getLabel(series) {
  return series[locale.value]
}
</script>

<template>
  <div
    class="iz-kfc-dropdown iz-kfc-dropdown--charts"
    :class="{ open: open }"
    @blur="closeDropdown()"
    tabindex="-1"
  >
    <div class="iz-kfc-dropdown__title srl-typo-headline3" @click="toggleState()">
      <span>{{ $t('kfc-dropdown.chart.title') }}</span>
      <SvgDropdown></SvgDropdown>
    </div>
    <div class="iz-kfc-dropdown__list" id="dropdown-content-charts" v-if="open">
      <div
        class="iz-kfc-dropdown__item iz-kfc-dropdown__item--charts"
        v-for="(chart, chartIndex) in charts"
        v-bind:key="chartIndex"
      >
        <div
          class="iz-kfc-dropdown__item-chart iz-kfc-dropdown__item-chart--charts"
          :class="{ active: activeChart == chart.id }"
        >
          <span @click="selectChart(chart)">{{ getLabel(chart.title) }}</span>
        </div>
        <template v-if="activeChart == chart.id">
          <div
            class="iz-kfc-dropdown__item-serie iz-kfc-dropdown__item-serie--charts"
            :class="{ active: props.activeSeries.includes(seriesIndex) }"
            v-for="(series, seriesIndex) in chart.series"
            @click="toggleSeries(seriesIndex)"
            v-bind:key="seriesIndex"
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
            <span v-html="getLabel(series.label)"></span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
