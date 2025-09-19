<script setup lang="ts">
/**
 * This Vue component script enables downloading an HTML table as an Excel file.
 * It uses the `exceljs` library to convert the table into an Excel format and trigger the download.
 *
 * ## Props:
 * - `titleSelector` (string, optional): CSS selector for the table titles. Default: `.srl-title-h1__text, .srl-page-title__overline, .srl-page-title__headline`.
 * - `font` (string, optional): Font used in the Excel file. Default: `Arial`.
 * - `defaultSheetName` (string, optional): Default name of the Excel worksheet. Default: `Table 1`.
 * - `defaultFileName` (string, optional): Default name of the downloaded file. Default: `Table`.
 * - `spacerRowHeight` (number, optional): Height of spacer rows in the Excel file. Default: `25`.
 * - `formatText` (Function, optional): Function to format cell content. Default: Trims text and returns `null` if empty.
 *
 * ## Types:
 * - `FormatText`: Type for the `formatText` function.
 * - `ElementStyles`: Style properties of an HTML element.
 * - `TextData`: Text data with styles.
 * - `CellData`: Data and styles of a table cell.
 * - `CellStyles`: Styles of a table cell.
 * - `TableIdElement`: HTML div element with a `data-tableid` attribute.
 * - `TableMatrix`: Matrix representing the table structure.
 *
 * ## Functions:
 * - `downloadTable()`: Initiates the download of the table as an Excel file.
 * - `parseColumns(worksheet: Worksheet)`: Parses the column widths of the table and sets them in the worksheet.
 * - `parseTitles()`: Extracts the table titles and their styles.
 * - `writeTitles(worksheet: Worksheet, titles: TextData[])`: Writes the titles to the worksheet.
 * - `parseTable()`: Converts the HTML table into a matrix of cells.
 * - `writeTable(worksheet: Worksheet, matrix: TableMatrix)`: Writes the table matrix to the worksheet.
 * - `mergeCells(worksheet: Worksheet, matrix: TableMatrix, excelRows: Row[])`: Merges cells with `rowSpan` or `colSpan`.
 * - `parseFootNotes()`: Extracts footnotes from the table.
 * - `writeFootNotes(worksheet: Worksheet, footNotes: TextData[])`: Writes the footnotes to the worksheet.
 * - `triggerDownload(fileName: string, buffer: ArrayBuffer)`: Triggers the download of the Excel file.
 * - `writeSpacerRow(worksheet: Worksheet)`: Adds a spacer row to the worksheet.
 * - `parseElementStyles(element: HTMLElement)`: Parses the styles of an HTML element.
 * - `rgbToArgb(rgb: string, alpha: number)`: Converts an RGB color to ARGB format.
 * - `getStyles(tableCell: HTMLTableCellElement)`: Extracts the styles of a table cell.
 *
 * ## Usage:
 * This component is used to export an HTML table to an Excel file.
 * It can be integrated into a Vue application and provides a button to trigger the export.
 */
import { ref, watch } from 'vue'
import { Workbook } from 'exceljs'
import type { Worksheet, Row } from 'exceljs/index.d.ts'

const props = withDefaults(defineProps<{
  component?: HTMLDivElement
  tableSelector?: string
  titleSelector?: string
  buttonLabel?: string
  buttonTitle?: string
  buttonDescription?: string
  font?: string
  defaultSheetName?: string
  defaultFileName?: string
  spacerRowHeight?: number
  formatText?: FormatText
}>(),{
  tableSelector: 'table',
  titleSelector: '.srl-title-h1__text, .srl-page-title__overline, .srl-page-title__headline',
  buttonLabel: 'Download',
  buttonDescription: 'Download table as Excel file',
  font: 'Arial',
  defaultSheetName: 'Table 1',
  defaultFileName: 'Table',
  spacerRowHeight: 25,
  formatText: (cell: HTMLTableCellElement) => {
    return cell.innerText !== '' ? cell.innerText.trim() : null
  }
})

type FormatText = (cell: HTMLTableCellElement) => string | null

type ElementStyles = {
  name: string,
  size: number,
  color: string,
  bold: boolean
}

interface TextData extends ElementStyles {
  value: string
}

type CellData = {
  value: string | null,
  styles: CellStyles,
  colSpan: number,
  rowSpan: number
}

type CellStyles = {
  alignment: {
    horizontal: string,
    vertical: string,
    wrapText: boolean
  },
  border: {
    top?: { style: string, color: { argb: string } },
    right?: { style: string, color: { argb: string } },
    bottom?: { style: string, color: { argb: string } },
    left?: { style: string, color: { argb: string } }
  },
  font: {
    name: string,
    size: number,
    color: { argb: string },
    bold: boolean
  },
  fill: {
    type?: string,
    pattern?: string,
    fgColor?: { argb: string }
  }
}

type TableIdElement = HTMLDivElement & {
  dataset: {
    tableid: string
  }
}

type TableMatrix = Array<Array<CellData>>

const rootElement = ref<HTMLDivElement>()
const table = ref<HTMLTableElement | null | undefined>(null)

watch(
  props,
  to => {
    !to.component || init(to.component)
  }
)

function init(componentEl: HTMLDivElement | undefined) {
  if (!componentEl) return
  rootElement.value = componentEl
  table.value = componentEl.querySelector(props.tableSelector) as HTMLTableElement
}

function getTable(): Promise<HTMLTableElement | null | undefined> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const checkTable = () => {
      const table = rootElement.value?.querySelector<HTMLTableElement>('table');
      if (table) {
        resolve(table);
      } else if (attempts >= 30) {
        reject(new Error('Table not found within the maximum number of attempts.'));
      } else {
        attempts++;
        setTimeout(checkTable, 10);
      }
    };

    checkTable();
  })
}

async function downloadTable() {
  if (!table.value) return

  const matrix = parseTable()
  const titles = parseTitles()
  const footNotes = parseFootNotes()
  const fileName = titles.map(t => t.value)

  const headTop: HTMLTableCellElement | null | undefined = rootElement.value?.querySelector('.head_top')
  if (headTop && headTop.textContent) {
    fileName.push(headTop.textContent.trim())
  }

  const tableIdElement = rootElement.value?.querySelector('[data-tableid]') as TableIdElement | null

  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet( tableIdElement?.dataset.tableid || props.defaultSheetName )

  parseColumns(worksheet)

  writeTitles(worksheet, titles)
  mergeCells(worksheet, matrix, writeTable(worksheet, matrix))
  writeFootNotes(worksheet, footNotes)

  triggerDownload(
    fileName.length ? fileName.join(' - ').replaceAll(' ', '_') : props.defaultFileName,
    await workbook.xlsx.writeBuffer()
  )
}

function parseColumns(worksheet: Worksheet): void {
  worksheet.columns = Array.from(table.value?.querySelectorAll('col') ?? [])
    .map(col => {
      return {
        width: col.offsetWidth / 7
      }
    })
}

function parseTitles(): TextData[] {
  const titleElements: HTMLElement[] = Array.from(document.querySelectorAll(props.titleSelector)) as HTMLElement[]
  const tableTitle: TextData[] = []
  titleElements.forEach( element => {
    if (!element || !element.textContent) return
    const styles = parseElementStyles(element)
    tableTitle.push(Object.assign({
      value: element.textContent.trim(),
    }, styles))
  })
  return tableTitle
}

function writeTitles( worksheet: Worksheet, titles: TextData[] ): void {
  if (titles.length === 0) return

  titles.forEach( title => {
    const row = worksheet.addRow([title.value])
    const cell = row.getCell(1)
    cell.font = {
      name: title.name,
      size: title.size,
      color: { argb: title.color },
      bold: title.bold
    }
    cell.alignment = {
      wrapText: true
    }
    worksheet.mergeCells(row.number, 1, row.number, worksheet.columns.length)
  })

  //writeSpacerRow(worksheet)
}

function parseTable(): TableMatrix  {
  if (!table.value) return []

  const matrix: TableMatrix = []

  const tableRows = Array.from(table.value.querySelectorAll('tr'))

  tableRows?.forEach( tableRowElem => {
    const row: CellData[] = []
    const tableCells: HTMLTableCellElement[] = Array.from(tableRowElem.querySelectorAll('th, td'))

    tableCells.forEach( tableCellElem => {

      const styles = getStyles(tableCellElem)

      row.push({
        value: props.formatText(tableCellElem),
        styles: styles,
        colSpan: tableCellElem.colSpan,
        rowSpan: tableCellElem.rowSpan,
      })

      if (tableCellElem.colSpan > 1) {
        for (let i = 1; i < tableCellElem.colSpan; i++) {
          row.push({
            value: null,
            styles: styles,
            colSpan: 1,
            rowSpan: 1
          })
        }
      }
    })

    matrix.push(row)
  })

  matrix.forEach( (row, rowIndex) => {
    row.forEach( (cell) => {
      const cellIndex = row.findIndex(c => c === cell)
      if (cell.rowSpan > 1) {
        for (let i = 1; i < cell.rowSpan; i++) {
          const nextRow = matrix[rowIndex + i]
          if (nextRow) {
            for (let i = 0; i < cell.colSpan; i++) {
              nextRow.splice(cellIndex, 0, {
                value: null,
                styles: cell.styles,
                colSpan: 1,
                rowSpan: 1
              })
            }
          }
        }
      }
    })
  })

  return matrix
}

function writeTable( worksheet: Worksheet, matrix: TableMatrix ): Row[] {
  const excelRows: Row[] = []
  matrix.forEach( row => {
    const excelRow = worksheet.addRow(row.map(cell => cell.value))
    row.forEach( (cell, index) => {
      const excelCell = excelRow.getCell(index + 1)

      excelCell.alignment = cell.styles.alignment
      excelCell.font = cell.styles.font
      cell.styles.fill ? excelCell.fill = cell.styles.fill : null
      excelCell.border = cell.styles.border
    })
    excelRows.push(excelRow)
  })
  return excelRows
}

function mergeCells( worksheet: Worksheet, matrix: TableMatrix, excelRows: Row[] ): void {
  matrix.forEach( (row, rowIndex) => {
    row.forEach( (cell, cellIndex) => {
      if (cell.rowSpan > 1 || cell.colSpan > 1) {
        const excelRow = excelRows[rowIndex]
        const startCell = cellIndex + 1
        const endCell = cellIndex + cell.colSpan
        const endRow = excelRow.number + ( cell.rowSpan - 1 )
        worksheet.mergeCells(excelRow.number, startCell, endRow, endCell)
      }
    })
  })
}

function parseFootNotes(): TextData[] {
  const footNoteData: TextData[] = []
  const footNotes = Array.from(rootElement.value?.querySelectorAll('.srl-footnote') ?? []) as HTMLDivElement[]

  footNotes.forEach(footNote => {
    const key: HTMLSpanElement | null = footNote.querySelector('.srl-footnote__key')
    const text: HTMLSpanElement | null = footNote.querySelector('.srl-footnote__text')

    if (text && text.textContent) {
      const row: string[] = []
      if (key && key.textContent) {
        row.push(key.textContent.trim())
      }
      row.push(text.textContent.trim())
      const styles = parseElementStyles(text)
      footNoteData.push(Object.assign({
        value: row.join(' '),
      }, styles))
    }
  })
  return footNoteData
}

function writeFootNotes( worksheet: Worksheet, footNotes: TextData[] ): void {
  if (footNotes.length === 0) return

  writeSpacerRow(worksheet)

  footNotes.forEach(footNote => {
    const row = worksheet.addRow([footNote.value])
    const cell = row.getCell(1)
    cell.font = {
      name: footNote.name,
      size: footNote.size,
      color: { argb: footNote.color },
      bold: footNote.bold
    }
    cell.alignment = {
      horizontal: 'left',
      vertical: 'top',
      wrapText: true
    }
    worksheet.mergeCells(row.number, 1, row.number, worksheet.columns.length)
  })
}

function triggerDownload( fileName: string, buffer: ArrayBuffer ): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName + '.xlsx'
  link.click()
  link.remove()
  URL.revokeObjectURL(link.href)
}

function writeSpacerRow(worksheet: Worksheet): void {
  const row = worksheet.addRow([])
  row.height = props.spacerRowHeight
  worksheet.mergeCells(row.number, 1, row.number, worksheet.columns.length)
}

function parseElementStyles(element: HTMLElement): ElementStyles | null {
  const styles = window.getComputedStyle(element)
  return {
    name: props.font,
    size: parseInt(styles.fontSize) * 0.75,
    color: rgbToArgb(styles.color),
    bold: parseInt(styles.fontWeight) > 400
  }
}

function rgbToArgb(rgb: string, alpha: number = 1): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/)
  if (!match) {
    throw new Error("Dies ist keine gültige RGB- oder RGBA-Farbe")
  }

  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])
  const a = match[4] !== undefined ? Math.round(parseFloat(match[4]) * 255) : Math.round(alpha * 255)

  const aHex = a.toString(16).padStart(2, '0')
  const rHex = r.toString(16).padStart(2, '0')
  const gHex = g.toString(16).padStart(2, '0')
  const bHex = b.toString(16).padStart(2, '0')

  return `${aHex}${rHex}${gHex}${bHex}`
}

function getStyles( tableCell: HTMLTableCellElement ): CellStyles {
  const styles: CellStyles = {
    alignment: {
      horizontal: window.getComputedStyle(tableCell).textAlign,
      vertical: window.getComputedStyle(tableCell).verticalAlign,
      wrapText: true
    },
    border: {},
    font: {
      name: 'Arial',
      size: parseInt(window.getComputedStyle(tableCell).fontSize) * 0.75,
      color: { argb: rgbToArgb(window.getComputedStyle(tableCell).color) },
      bold: parseInt(window.getComputedStyle(tableCell).fontWeight) > 400
    },
  }

  const brdTopWidth = parseInt(window.getComputedStyle(tableCell).borderTopWidth)
  if (brdTopWidth) {
    styles.border.top = {
      style: brdTopWidth < 3 ? 'thin' : brdTopWidth < 6 ? 'medium' : 'thick',
      color: {argb: rgbToArgb(window.getComputedStyle(tableCell).borderTopColor)}
    }
  }

  const brdRightWidth = parseInt(window.getComputedStyle(tableCell).borderRightWidth)
  if (brdRightWidth) {
    styles.border.right = {
      style: brdRightWidth < 3 ? 'thin' : brdRightWidth < 6 ? 'medium' : 'thick',
      color: {argb: rgbToArgb(window.getComputedStyle(tableCell).borderRightColor)}
    }
  }

  const brdBottomWidth = parseInt(window.getComputedStyle(tableCell).borderBottomWidth)
  if (brdBottomWidth) {
    styles.border.bottom = {
      style: brdBottomWidth < 3 ? 'thin' : brdBottomWidth < 6 ? 'medium' : 'thick',
      color: {argb: rgbToArgb(window.getComputedStyle(tableCell).borderBottomColor)}
    }
  }

  const brdLeftWidth = parseInt(window.getComputedStyle(tableCell).borderLeftWidth)
  if (brdLeftWidth) {
    styles.border.left = {
      style: brdLeftWidth < 3 ? 'thin' : brdLeftWidth < 6 ? 'medium' : 'thick',
      color: {argb: rgbToArgb(window.getComputedStyle(tableCell).borderLeftColor)}
    }
  }

  const bgColor = rgbToArgb(window.getComputedStyle(tableCell).backgroundColor)
  if (bgColor.substring(0,2) !== '00') {
    styles.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {argb: bgColor}
    }
  }

  return styles
}

</script>

<template>
    <button
      v-if="table"
      type="button"
      :title="$te('table.download.title') ? $t('table.download.title') : props.buttonTitle ?? props.buttonLabel"
      :aria-label="$te('table.download.label') ? $t('table.download.label') : props.buttonLabel"
      :aria-description="$te('table.download.description') ? $t('table.download.description') : props.buttonDescription"
      class="srl-button"
      @click="downloadTable"
    >
      <i class="srl-icon srl-icon-download" aria-hidden="true"></i>
      <span v-text="$te('table.download.label') ? $t('table.download.label') : props.buttonLabel" />
    </button>
</template>