import * as XLSX from 'xlsx'

const reservedColumnKeywords = [
  'CHART',
  'SERIES',
  'CATEGORY_COLOR',
  'FOOTNOTE',
  'YAXIS_NAME',
  'TITLE'
]

const languageIndexMap = {}

async function generateKFCJson(languages) {
  const response = await fetch(`./downloads/de/mehrjahresvergleich.xlsx`)
  const arrayBuffer = await response.arrayBuffer()
  const parsedExcel = XLSX.readFile(arrayBuffer, { type: 'array', codepage: 65001 })

  const charts = []

  for (let index = 0; index < parsedExcel.SheetNames.length; index++) {
    const sheetName = parsedExcel.SheetNames[index]
    const sheet = parsedExcel.Sheets[sheetName]
    const sheetCSVData = XLSX.utils.sheet_to_csv(sheet, { blankrows: false, FS: ';' })
    const chart = sheetToJson(
      sheetName,
      sheetCSVData.split('\n').map((data) => data.split(';')),
      [...languages]
    )
    charts.push(chart)
  }

  return charts
}

function languageIndex(languages, chartConfiguration) {
  if (!chartConfiguration) return
  languages.forEach((language) => {
    chartConfiguration.find((value, languageIndex) => {
      if (value === `name_${language}`) {
        languageIndexMap[language] = languageIndex
        return true
      }
      return false
    })
  })
}

function parseFootnotes(csvData, footnoteStartIndex) {
  const footnotes = []

  for (let index = footnoteStartIndex + 1; index < csvData.length; index++) {
    const row = csvData[index]
    if (reservedColumnKeywords.includes(row[0])) {
      index = csvData.length
    } else {
      footnotes.push(row)
    }
  }

  return footnotes.map((footnote) => {
    const footnoteValues = {}
    Object.keys(languageIndexMap).forEach((key) => {
      footnoteValues[key] = footnote[languageIndexMap[key]]
    })

    return {
      key: footnote[0],
      value: footnoteValues
    }
  })
}

function parseSeries(csvData, seriesStartIndex) {
  const seriesRows = []

  for (let index = seriesStartIndex; index < csvData.length; index++) {
    const row = csvData[index]
    if (reservedColumnKeywords.includes(row[0]) && row[0] !== 'SERIES') {
      index = csvData.length
    } else {
      seriesRows.push(row)
    }
  }

  return seriesRows.map((row) => {
    const labelMap = {}

    const seriesData = row.filter((column, columnIndex) => {
      if (columnIndex > lastLanguageIndex()) return true
      return false
    })

    Object.keys(languageIndexMap).forEach((key) => {
      labelMap[key] = row[languageIndexMap[key]]
    })

    return {
      label: labelMap,
      data: seriesData.map((d) => parseFloat(d)),
      type: row[1],
      colorIndex: row[2],
      stack: parseInt(row[3]),
      yAxis: parseInt(row[4]),
      defaultVisible: row[5] === 'true'
    }
  })
}

function lastLanguageIndex() {
  return Math.max(...Object.keys(languageIndexMap).map((key) => languageIndexMap[key]))
}

function parseCategories(chartConfiguration) {
  return chartConfiguration.filter((column, columnIndex) => {
    return columnIndex > lastLanguageIndex()
  })
}

function parseChartColors(chartColorConfiguration) {
  return chartColorConfiguration.filter((column, columnIndex) => {
    return columnIndex > lastLanguageIndex()
  })
}

function parseChartTitle(titleConfiguration) {
  const titleMap = {}

  Object.keys(languageIndexMap).forEach((key) => {
    titleMap[key] = titleConfiguration[languageIndexMap[key]]
  })

  return titleMap
}

function parseYaxisLabels(csvData) {
  const yAxis = [{}, {}]
  const yAxisStartIndex = csvData.indexOf(csvData.find((r) => r[0] === 'YAXIS_NAME')) + 1

  for (let index = yAxisStartIndex; index < csvData.length; index++) {
    const row = csvData[index]
    if (reservedColumnKeywords.includes(row[0])) {
      index = csvData.length
    } else {
      yAxis[row[0]] = row
    }
  }

  return yAxis
    .sort((columnsA, columnsB) => {
      if (parseInt(columnsA[0]) < parseInt(columnsB[0])) return -1
      if (parseInt(columnsA[0]) > parseInt(columnsB[0])) return 1
      return 0
    })
    .map((d) => {
      const axis = {}

      Object.keys(languageIndexMap).forEach((key) => {
        axis[key] = d[languageIndexMap[key]]
      })
      return axis
    })
}

function sheetToJson(sheetName, csvData, languages) {
  const chartConfiguration = csvData.find((r) => r[0] === 'CHART')
  const categoryColorConfiguration = csvData.find((r) => r[0] === 'CATEGORY_COLOR')
  if (!chartConfiguration) return
  languageIndex(languages, chartConfiguration)
  const titleConfiguration = csvData[csvData.indexOf(csvData.find((r) => r[0] === 'TITLE')) + 1]
  const footnoteStartIndex = csvData.indexOf(csvData.find((r) => r[0] === 'FOOTNOTE'))
  const seriesStartIndex = csvData.indexOf(csvData.find((r) => r[0] === 'SERIES'))

  const series = parseSeries(csvData, seriesStartIndex)
  const categories = parseCategories(chartConfiguration)
  const yAxisLabels = parseYaxisLabels(csvData)

  return {
    id: sheetName.replaceAll(' ', ''),
    title: parseChartTitle(titleConfiguration),
    footnotes: parseFootnotes(csvData, footnoteStartIndex),
    swapColors: parseChartColors(categoryColorConfiguration),
    series: series,
    categories: categories,
    defaultActiveSeries: series
      .map((serie, serieIndex) => (serie.defaultVisible ? serieIndex : -1))
      .filter((d) => d >= 0),
    defaultActiveCategories: categories.map((c, i) => i),
    yAxisLabel0: yAxisLabels[0],
    yAxisLabel1: yAxisLabels[1] || {}
  }
}

export default generateKFCJson
