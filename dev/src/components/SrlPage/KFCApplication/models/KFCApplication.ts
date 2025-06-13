import { ref } from 'vue'
import useKfcData from '@/components/SrlPage/KFCApplication/hooks/kfcData'

export class KFCApplication {
  currentChart
  jsonData = ref({})
  searchQueryConfiguration = ref({
    activeChart: '',
    chartType: 'column',
    swapLabels: false,
    activeCategories: [],
    activeSeries: [],
    indexedView: false
  })

  constructor(locale) {
    this.currentChart = ref({})
    this.currentLang = ref('de')
    this.dataLoaded = ref(false)
    this.currentLang.value = locale

    this.loadApplicationData().then((data) => {
      this.jsonData.value = data
      this.currentChart.value = this.getCharts()[0]
      this.dataLoaded.value = true
    })
  }

  async loadApplicationData() {
    return await useKfcData()
  }

  readQuery() {
    const queryString = window.location.search
    const searchParams = new URLSearchParams(queryString)

    this.currentChart.value = this.getCharts().find(
      (chart) => chart.id == searchParams.get('activeChart')
    )
    if (!this.currentChart.value) this.currentChart.value = this.getCharts()[0]

    this.searchQueryConfiguration.value = {
      activeChart: this.currentChart.value.id,
      chartType: searchParams.get('chartType'),
      swapLabels: searchParams.get('swapLabels') == '1',
      activeCategories: searchParams
        .get('activeCategories')
        .split(',')
        .map((n) => parseInt(n)),
      activeSeries: searchParams
        .get('activeSeries')
        .split(',')
        .map((n) => parseInt(n)),
      indexedView: searchParams.get('indexed') == '1'
    }
  }

  writeDefaultQuery() {
    if (this.currentChart.value) {
      this.searchQueryConfiguration.value = {
        activeChart: this.currentChart.value.id,
        chartType: 'column',
        swapLabels: false,
        activeCategories: this.currentChart.value.defaultActiveCategories.map((a, i) => i),
        activeSeries: this.currentChart.value.defaultActiveSeries.map((a, i) => i),
        indexedView: false
      }
      this.writeQuery()
    }
  }

  getCharts() {
    if (this.jsonData.value) {
      return this.jsonData.value || []
    }
    return []
  }

  set activeSeries(newSeries) {
    this.searchQueryConfiguration.value.activeSeries = newSeries
    if (!this.canSwapLabels()) {
      this.swapLabels = false

      return
    }
  }

  get activeChart() {
    return this.searchQueryConfiguration.value.activeChart
  }

  get activeSeries() {
    return this.searchQueryConfiguration.value.activeSeries
  }

  set activeCategories(newCategories) {
    this.searchQueryConfiguration.value.activeCategories = newCategories
  }

  get activeCategories() {
    return this.searchQueryConfiguration.value.activeCategories
  }

  set swapLabels(newSwapLabel) {
    this.searchQueryConfiguration.value.swapLabels = newSwapLabel
  }

  get swapLabels() {
    return this.searchQueryConfiguration.value.swapLabels
  }

  set indexed(newIndexed) {
    this.searchQueryConfiguration.value.indexedView = newIndexed
  }

  get indexed() {
    return this.searchQueryConfiguration.value.indexedView
  }

  get chartType() {
    return this.searchQueryConfiguration.value.chartType
  }

  set chartType(newChartType) {
    this.searchQueryConfiguration.value.chartType = newChartType
  }

  updateActiveChart(newChart) {
    this.currentChart.value = newChart

    this.searchQueryConfiguration.value.activeChart = newChart.id
    this.searchQueryConfiguration.value.activeCategories = newChart.defaultActiveCategories
    this.searchQueryConfiguration.value.activeSeries = newChart.defaultActiveSeries
    this.searchQueryConfiguration.value.swapLabels = false
  }

  changeChartType(newChartType) {
    this.searchQueryConfiguration.value.chartType = newChartType
    this.searchQueryConfiguration.value.swapLabels = false
  }

  loadChartCSV() {}

  processChartCSV() {
    return {
      series: [],
      categories: [],
      defaultActiveCategories: [],
      defaultActiveSeries: [],
      defaultActiveChartType: 'column'
    }
  }

  canSwapLabels() {
    let can = true
    if (this.currentChart.value.series) {
      this.currentChart.value.series
        .filter((s, si) => this.activeSeries.includes(si))
        .forEach((series) => {
          can = can && series.type == 'column'
        })
    }
    return can
  }

  writeQuery() {
    const url = new URL(window.location.toString())
    const query = {
      activeChart: this.searchQueryConfiguration.value.activeChart,
      chartType: this.searchQueryConfiguration.value.chartType,
      swapLabels: this.searchQueryConfiguration.value.swapLabels && this.canSwapLabels() ? 1 : 0,
      activeSeries: this.searchQueryConfiguration.value.activeSeries.join(','),
      activeCategories: this.searchQueryConfiguration.value.activeCategories.join(','),
      indexed: this.searchQueryConfiguration.value.indexedView ? 1 : 0
    }

    Object.keys(query).forEach((key) => {
      url.searchParams.set(key, query[key])
    })

    window.history.pushState(null, '', url)
  }
}
