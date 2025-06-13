<script setup>
import Highcharts from 'highcharts'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  categories: Array,
  series: Array,
  currentChart: Object,
  footnotes: Array
})

const { locale } = useI18n()

function getAxisLabel(serie) {
  const label =
    props.currentChart.value[serie.yAxis == 0 ? 'yAxisLabel0' : 'yAxisLabel1'][locale.value]
  if (label && label.trim().length > 0) return ` (${label})`
  return ''
}
</script>

<template>
  <div class="kfc-table-wrapper">
    <table data-tableid="kfc">
      <tbody>
        <tr class="head">
          <td class="head"></td>
          <td class="srl-horizontal-left ns-horizontal-left head noline"> </td>
          <td
            class="ns-horizontal-right line_bold head"
            :class="{ 'srl-background-05': categoryIndex == props.categories.length - 1 }"
            v-for="(category, categoryIndex) in props.categories"
          >
            {{ category }}
          </td>
        </tr>
        <tr v-for="serie in props.series">
          <td
            class="ns-horizontal-left line"
            v-html="serie.label[locale] + getAxisLabel(serie)"
          ></td>
          <td class="srl-horizontal-left ns-horizontal-left noline"> </td>
          <td
            class="ns-horizontal-right nowrap"
            :class="{ 'srl-background-05': dataIndex == serie.data.length - 1 }"
            v-for="(data, dataIndex) in serie.data"
          >
            {{ Highcharts.numberFormat(data, 1) }}
          </td>
        </tr>
        <tr class="konturu">
          <td class="ns-horizontal-left line konturu"></td>
          <td class="srl-horizontal-left ns-horizontal-left noline"> </td>
          <td
            class="ns-horizontal-right nowrap"
            :class="{ 'srl-background-05': index === props.series[0]?.data.length - 1 }"
            v-for="(_, index) in props.series[0]?.data.length"
          ></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
