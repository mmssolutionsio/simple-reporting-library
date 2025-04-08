<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import * as Highcharts from 'highcharts'
import exportingModule from 'highcharts/modules/exporting'
import offlineExporting from 'highcharts/modules/offline-exporting'

import { KFCApplication } from '@/components/SrlPage/KFCApplication/models/KFCApplication'

import KFCTable from '@/components/SrlPage/KFCApplication/KFCTable.vue'
import KFCDropdownCharts from '@/components/SrlPage/KFCApplication/KFCDropdownCharts.vue'
import KFCDropdownPeriod from '@/components/SrlPage/KFCApplication/KFCDropdownPeriod.vue'
import XDownloader from '@/components/SrlPage/KFCApplication/utils/XDownloader.js'
import XDownloaderStyle from '@/components/SrlPage/KFCApplication/utils/XDownloaderStyle.js'

import SvgColumnView from '@/components/SrlPage/KFCApplication/theme/SvgColumnView.vue'
import SvgLineView from '@/components/SrlPage/KFCApplication/theme/SvgLineView.vue'
import SvgTableView from '@/components/SrlPage/KFCApplication/theme/SvgTableView.vue'
import SvgIndexedValues from '@/components/SrlPage/KFCApplication/theme/SvgIndexedValues.vue'
import SvgLegendSwap from '@/components/SrlPage/KFCApplication/theme/SvgLegendSwap.vue'
import SvgDownloadChart from '@/components/SrlPage/KFCApplication/theme/SvgDownloadChart.vue'
import SvgPDFChart from '@/components/SrlPage/KFCApplication/theme/SvgPDFChart.vue'
import SvgPrintChart from '@/components/SrlPage/KFCApplication/theme/SvgPrintChart.vue'

exportingModule(Highcharts)
offlineExporting(Highcharts)

const { locale } = useI18n()
const kfcApplication = new KFCApplication(locale.value)
const renderApplication = ref(false)
const chartRef = ref()
const tableRef = ref()
const kfcChart = ref()
const decimalPoint = {
  de: '.',
  en: '.',
  it: '.',
  fr: ','
}
const thousandsSep = {
  de: ' ',
  en: ',',
  it: ' ',
  fr: ' '
}

function hasNthYAxisDisplayed(nth: number) {
  return !!kfcApplication.currentChart.value.series
    .filter((d, i) => kfcApplication.activeSeries.includes(i))
    .find((d) => d.yAxis === nth)
}

function getSeries() {
  const { swapLabels, indexed } = kfcApplication
  if (swapLabels && indexed) {
    return _getIndexedLabelSwapSeries()
  } else if (swapLabels) {
    return _getLabelSwapSeries()
  } else if (indexed) {
    return _getIndexedSeries()
  }

  return _getSeries()
}

function _getSeries() {
  const { currentChart, activeSeries, activeCategories, chartType } = kfcApplication
  const { series } = currentChart.value

  return series
    .map((serie, serieIndex) => ({
      ...serie,
      visible: activeSeries.includes(serieIndex)
    }))
    .map((serie) => {
      const filteredData = serie.data.filter((d, i) => activeCategories.includes(i))
      const transformedType = handleChartTypeSerie(serie.type)
      const newValue = {
        name: serie.label[locale.value],
        colorIndex: serie.colorIndex,
        type: transformedType,
        yAxis: serie.yAxis || 0,
        data: filteredData,
        zIndex: transformedType === 'line' ? 3 : 1,
        stack: undefined,
        stacking: undefined,
        visible: serie.visible
      }

      if (serie.stack > 0 && chartType === 'column') {
        newValue.stack = serie.stack
        newValue.stacking = 'default'
      }

      return newValue
    })
}

function _getIndexedSeries() {
  return _getSeries().map((serie) => ({
    ...serie,
    stack: undefined,
    stacking: undefined,
    data: serie.data.map((d) => {
      if (d <= 0) {
        // N/A
        return 0
      }

      return Math.round(Math.round((d / serie.data[0]) * 10000) / 100)
    })
  }))
}

function _getLabelSwapSeries() {
  const { currentChart, activeSeries, activeCategories } = kfcApplication
  const { categories, series, swapColors } = currentChart.value

  return categories.map((category, categoryIndex) => {
    const categoryData = series
      .map((serie) => serie.data[categoryIndex])
      .filter((s, i) => activeSeries.includes(i))
    return {
      name: category,
      type: 'column',
      stack: undefined,
      yAxis: 0,
      colorIndex: swapColors[categoryIndex],
      data: categoryData,
      visible: activeCategories.includes(categoryIndex)
    }
  })
}

function _getIndexedLabelSwapSeries() {
  const swappedSeries = _getLabelSwapSeries()
  const baseSeries = swappedSeries.find((x) => x.visible)

  const indexed = swappedSeries.map((serie) => {
    return {
      ...serie,
      stack: undefined,
      stacking: undefined,
      data: serie.data.map((d, di) => {
        if (d <= 0) {
          // N/A
          return 0
        }

        return Math.round(Math.round((d / baseSeries.data[di]) * 10000) / 100)
      })
    }
  })

  return indexed
}

function getCategories() {
  const { swapLabels } = kfcApplication

  if (swapLabels) {
    return _getLabelSwapCategories()
  }

  return _getCategories()
}
function _getCategories() {
  const { activeCategories, currentChart } = kfcApplication
  const { categories } = currentChart.value

  return categories.filter((x, i) => activeCategories.includes(i))
}

function _getLabelSwapCategories() {
  const { currentChart, activeSeries } = kfcApplication
  const { series } = currentChart.value

  return series
    .map((serie) => serie.label[locale.value])
    .filter((serie, i) => activeSeries.includes(i))
}

function updateCategories(newCategories) {
  kfcApplication.activeCategories = newCategories.sort()
  kfcApplication.writeQuery()
  updateChart()
}

function updateSeries(newSeries) {
  kfcApplication.activeSeries = newSeries.sort()
  kfcApplication.writeQuery()
  updateChart()
}

function toggleIndexed() {
  kfcApplication.indexed = !kfcApplication.indexed
  kfcApplication.writeQuery()
  renderChart()
}

function toggleSwapLabels() {
  if (kfcApplication.canSwapLabels()) {
    kfcApplication.swapLabels = !kfcApplication.swapLabels
  } else {
    kfcApplication.swapLabels = false
  }
  kfcApplication.writeQuery()
  renderChart()
}

function updateActiveChart(newChart) {
  kfcApplication.updateActiveChart(newChart)
  kfcApplication.writeQuery()
  renderChart()
}

function changeChartType(chartType) {
  kfcApplication.chartType = chartType
  kfcApplication.swapLabels = false
  kfcApplication.writeQuery()
  renderChart()
}

function handleChartTypeSerie(serie) {
  if (kfcApplication.chartType == 'line') {
    if (serie == 'column') return 'line'
    if (serie == 'line') return 'column'
    return serie
  }
  return serie
}

function seriesStateChangedEvent(event) {
  if (!event?.legendItem) {
    //console.error('LEGEND ITEM IS UNDEFINED')
    return
  }

  const { activeCategories, activeSeries, swapLabels } = kfcApplication
  const { index, visible } = event.legendItem

  event.preventDefault()

  if (swapLabels) {
    if (visible) {
      updateCategories([...activeCategories.filter((x) => x !== index)])
    } else {
      updateCategories([...activeCategories, index])
    }
  } else {
    if (visible) {
      updateSeries(activeSeries.filter((x) => x !== index))
    } else {
      updateSeries([...activeSeries, index])
    }
  }
}

function updateChart() {
  if (chartRef.value && chartRef.value && chartRef.value.destroy) {
    chartRef.value.update(
      {
        series: getSeries(),
        xAxis: { categories: getCategories() }
      },
      true
    )
    chartRef.value.yAxis[0].update({
      title: {
        enabled: hasNthYAxisDisplayed(0),
        text: kfcApplication.indexed
          ? '%'
          : kfcApplication.currentChart.value.yAxisLabel0[locale.value]
      }
    })
    chartRef.value.yAxis[1].update({
      title: {
        enabled: hasNthYAxisDisplayed(1),
        text: kfcApplication.indexed
          ? '%'
          : kfcApplication.currentChart.value.yAxisLabel1[locale.value]
      }
    })
  }
}

function renderChart() {
  Highcharts.setOptions({
    lang: {
      decimalPoint: decimalPoint[locale.value],
      thousandsSep: thousandsSep[locale.value]
    }
  })

  if (!kfcApplication.currentChart) {
    return
  }

  if (kfcApplication.chartType == 'table') {
    // table does not need to update highchart
    return
  }

  if (chartRef.value && chartRef.value && chartRef.value.destroy) {
    try {
      chartRef.value.destroy()
    } catch (error) {
      //
    }
  }
  try {
    chartRef.value = Highcharts.chart(document.querySelector('#kfc-chart'), {
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 700
            },
            chartOptions: {
              chart: {
                height: '150%'
              }
            }
          }
        ]
      },
      chart: {
        height: '56.9%',
        styledMode: true,
        spacingLeft: 5,
        spacingRight: 5,
        spacingBottom: 0,
        reflow: true
      },
      legend: {
        layout: 'horizontal',
        alignColumns: false,
        align: 'left',
        symbolRadius: 0,
        events: {
          itemClick: (e) => seriesStateChangedEvent(e)
        }
      },
      plotOptions: {
        line: {
          marker: {
            symbol: 'circle'
          }
        },
        column: {
          borderRadius: 0,
          legendSymbol: 'rectangle',
          pointPadding: 0
        },
        series: {
          marker: {
            height: 8,
            width: 8
          },
          dataLabels: {
            formatter: function () {
              return Highcharts.numberFormat(this.y, 2)
            }
          }
        }
      },
      title: {
        enabled: false,
        text: kfcApplication.currentChart.value.label
      },
      credits: {
        enabled: false
      },
      series: getSeries(),
      yAxis: [
        {
          title: {
            enabled: hasNthYAxisDisplayed(0),
            text: kfcApplication.indexed
              ? '%'
              : kfcApplication.currentChart.value.yAxisLabel0[locale.value]
          },
          reversedStacks: false,
          labels: {},
          tickAmount: 8
        },
        {
          reversedStacks: false,
          allowDecimals: false,
          title: {
            enabled: hasNthYAxisDisplayed(1),
            text: kfcApplication.indexed
              ? '%'
              : kfcApplication.currentChart.value.yAxisLabel1[locale.value]
          },
          labels: {},
          opposite: true,
          tickAmount: 8
        }
      ],
      xAxis: {
        categories: getCategories()
      },
      exporting: {
        enabled: false
      },
      tooltip: {
        useHTML: true,
        shadow: false,
        borderWidth: 0,
        className: 'kfc-tooltip',
        formatter: function (tooltip) {
          if (kfcApplication.indexed) {
            if (this.y == 100) {
              return `<div>${this.y}%</div>`
            } else if (this.y == 0) {
              return `<div>n/a</div>`
            }
            return `
            <div>
              ${this.y}%
              <br>Δ ${this.y - 100 > 0 ? '+' : ''}${Highcharts.numberFormat(
                Math.round((this.y - 100) * 100) / 100,
                -1
              )}%
            </div>`
          } else {
            //console.log(this)
            const axisStr = this.point?.series?.yAxis?.axisTitle
              ? this.point.series.yAxis.axisTitle.textStr
              : ''
            return `${this.x}<br>
            <span class="tooltip-series-color color-${this.colorIndex}" data-series-color="${this.colorIndex}"></span>
            ${this.series.name}: <span class="tooltip-series-value">${Highcharts.numberFormat(this.y, 1)} ${axisStr}</span>`
          }
        }
      }
    })
  } catch (error) {
    console.error('Error creating chart', error)
  }
}

function downloadExcel() {
  new XDownloader({
    tableTitle: kfcApplication.currentChart.value.title[locale.value],
    tableSelector: '.iz-keyfigure-comparison__table',
    downloadText: '',
    styles: XDownloaderStyle,
    mergeStrings: []
  })
}

function printPage() {
  document.body.classList.add('pdf-print')
  setTimeout(() => {
    window.print()
    document.body.classList.remove('pdf-print')
  }, 500)
}

function exportHighchart() {
  chartRef.value.exportChartLocal(
    {
      type: 'image/png',
      filename: kfcApplication.currentChart.value.title[locale.value]
    },
    {
      chart: {
        width: 800,
        height: 600
      },
      title: {
        enabled: true,
        text: kfcApplication.currentChart.value.title[locale.value]
      },
      subtitle: {
        enabled: false,
        text: kfcApplication.currentChart.value.title[locale.value]
      },

      yAxis: [
        {
          title: {
            enabled: true,
            text: kfcApplication.indexed
              ? '%'
              : kfcApplication.currentChart.value.yAxisLabel0[locale.value]
          }
        },
        {
          title: {
            enabled: true,
            text: kfcApplication.indexed
              ? '%'
              : kfcApplication.currentChart.value.yAxisLabel1[locale.value]
          }
        }
      ]
    }
  )
}

function reloadApplication(count = 0) {
  if (count > 100) {
    console.error('KFC Application not loaded')
    return
  }

  setTimeout(() => {
    if (kfcApplication.dataLoaded.value) {
      if (!window.location.search || window.location.search == '') {
        kfcApplication.writeDefaultQuery()
      } else {
        kfcApplication.readQuery()
      }
      renderApplication.value = true
      setTimeout(() => {
        renderChart()
      }, 300)
    } else {
      reloadApplication(count++)
    }
  }, 300)
}

watch(locale, () => {
  kfcApplication.currentLang.value = locale.value
})

onMounted(() => {
  Highcharts.setOptions({
    lang: {
      numericSymbols: null,
      thousandsSep: "'",
      decimalPoint: decimalPoint[locale.value]
    }
  })
  reloadApplication()
})
</script>

<template>
  <div v-if="renderApplication" class="srl-kfc">
    <div class="iz-content__content iz-keyfigure-comparison">
      <div class="srl-article__grid srl-article__grid--kfc srl-mt-400">
        <div class="srl-article__grid--inner">
          <KFCDropdownCharts
            :charts="kfcApplication.getCharts()"
            :activeSeries="kfcApplication.activeSeries"
            :activeChart="kfcApplication.activeChart"
            :changeChart="updateActiveChart"
            :updateSeries="updateSeries"
          >
          </KFCDropdownCharts>
          <KFCDropdownPeriod
            :categories="kfcApplication.currentChart.value.categories"
            :active-categories="kfcApplication.activeCategories"
            :updateCategories="updateCategories"
          >
          </KFCDropdownPeriod>
        </div>
      </div>
      <div class="srl-article__grid srl-article__grid--kfc srl-mt-900">
        <div class="srl-article__grid--inner">
          <h2 class="srl-title-h2 srl-component srl-title srl-color-dark kfc-chart-title">
            <span
              class="srl-typo-headline2"
              v-text="kfcApplication.currentChart.value.title[locale]"
            >
            </span>
          </h2>
          <div class="iz-keyfigure-comparison__export-actions kfc-chart-actions">
            <button
              class="srl-button-kfc srl-button-kfc-icon srl-typo-copy2 srl-color-dark"
              @click="exportHighchart()"
            >
              <SvgPrintChart></SvgPrintChart>
              <span>{{ $t('kfc.labels.action.png') }}</span>
            </button>
            <button
              class="srl-button-kfc srl-button-kfc-icon srl-typo-copy2 srl-color-dark"
              @click="downloadExcel()"
            >
              <SvgDownloadChart></SvgDownloadChart>
              <span>{{ $t('kfc.labels.action.xls') }}</span>
            </button>
            <button
              class="srl-button-kfc srl-button-kfc-icon srl-typo-copy2 srl-color-dark"
              @click="printPage()"
            >
              <SvgPDFChart></SvgPDFChart>
              <span>{{ $t('kfc.labels.action.print') }}</span>
            </button>
          </div>
        </div>
      </div>
      <div class="srl-article__grid srl-article__grid--kfc srl-mt-600">
        <div class="srl-article__grid--inner">
          <div class="iz-kfc-chart-types">
            <button
              class="srl-button-kfc"
              :class="{ active: kfcApplication.chartType == 'column' }"
              @click="changeChartType('column')"
            >
              <SvgColumnView></SvgColumnView>
            </button>
            <button
              class="srl-button-kfc"
              :class="{ active: kfcApplication.chartType == 'line' }"
              @click="changeChartType('line')"
            >
              <SvgLineView></SvgLineView>
            </button>
            <button
              class="srl-button-kfc"
              :class="{ active: kfcApplication.chartType == 'table' }"
              @click="changeChartType('table')"
            >
              <SvgTableView></SvgTableView>
            </button>
          </div>

          <div class="iz-kfc-chart-toggles">
            <button
              @click="toggleIndexed()"
              class="srl-button-kfc srl-button-kfc-icon srl-typo-copy2 srl-color-dark"
            >
              <SvgIndexedValues></SvgIndexedValues>
              <span v-if="!kfcApplication.indexed">{{ $t('kfc.indexed.indexed') }}</span>
              <span v-else>{{ $t('kfc.indexed.absolute') }}</span>
            </button>
            <button
              @click="toggleSwapLabels()"
              v-if="kfcApplication.canSwapLabels() && kfcApplication.chartType == 'column'"
              class="srl-button-kfc srl-button-kfc-icon srl-typo-copy2 srl-color-dark"
              :class="{ active: kfcApplication.swapLabels }"
            >
              <SvgLegendSwap></SvgLegendSwap>
              <span>{{ $t('kfc.swaplabels') }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="srl-article__grid srl-article__grid--kfc srl-mt-600">
        <div class="srl-article__grid--inner">
          <div
            id="kfc-chart"
            class="iz-keyfigure-comparison__chart"
            :class="{ hidden: kfcApplication.chartType == 'table' }"
          ></div>
          <div class="iz-keyfigure-comparison__table">
            <KFCTable
              :currentChart="kfcApplication.currentChart"
              :class="{ hidden: kfcApplication.chartType != 'table' }"
              :categories="
                kfcApplication.currentChart.value.categories?.filter((c, i) =>
                  kfcApplication.activeCategories.includes(i)
                )
              "
              :series="
                kfcApplication.currentChart.value.series
                  ?.filter((s, i) => kfcApplication.activeSeries.includes(i))
                  .map((d) => ({
                    ...d,
                    data: d.data.filter((a, i) => kfcApplication.activeCategories.includes(i))
                  }))
              "
            >
            </KFCTable>
          </div>
        </div>
      </div>
    </div>

    <div class="srl-article__grid srl-article__grid--kfc srl-mt-300">
      <div class="srl-article__grid--inner">
        <p
          class="iz-keyfigure-comparison__footnote"
          v-for="(footnote, footnoteIndex) in kfcApplication.currentChart.value.footnotes"
          v-bind:key="footnoteIndex"
        >
          <span class="iz-keyfigure-comparison__footnote-key" v-html="footnote.key"></span>
          <span class="iz-keyfigure-comparison__footnote-text">{{ footnote.value[locale] }}</span>
        </p>
      </div>
    </div>
  </div>
  <div v-else class="srl-kfc">
    <div class="iz-content__content">
      <div class="srl-article__grid srl-article__grid--kfc srl-mt-900">
        <div class="srl-article__grid--inner">
          <p class="srl-typo-copy1 srl-color-primary loading-text">
            {{ $t('kfcLoadingText') }}
          </p>
          <div class="loader-container">
            <span class="loader"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use 'scss/_highcharts-basic';
@use 'scss/_highcharts-general';
@use 'scss/_highcharts-custom';
@use 'scss/_iz-keyfigure-comparison';
@use 'scss/_iz-keyfigure-comparison-dropdown';
@use 'scss/_srl-button-kfc';
@use 'scss/_kfc-loading';
@use 'scss/_kfc-print';
</style>
