import XTableNamer from './XTableNamer.js'
import * as Excel from 'exceljs/dist/exceljs.min.js'
import { saveAs } from 'file-saver'

/**
 * Exceldownload working with NSWOW2 Tables
 */
class XDownloader {
  constructor(config = {}) {
    const {
      tableTitle,
      tableSelector,
      excludeTableSelector,
      downloadText, // Text for downloadbutton, can be empty if you want to use an icon
      styles, // cell Styles from classes
      numFmt, // numFmt overwrite for custom formatting
      mergeStrings, // Set mergeStrings for all Tables
      tableCellFormatter,
      footnoteFormatter
    } = config

    const env = this.getEnvironement()

    this.excludeTableSelector = excludeTableSelector || null
    this.tableSelector = tableSelector || '.ns-table-wrap'
    this.downloadText = downloadText || 'XLS' //Text on button, can be empty
    this.tableTitle = tableTitle || null
    this.styles =
      styles.map((item) => {
        if (!item.index) item.index = 0
        return item
      }) || {}
    this.numFmt = numFmt || function (cell) {}
    this.mergeStrings = mergeStrings || []
    this.tableCellFormatter = tableCellFormatter || this.htmlTableCellFormatter
    this.footnoteFormatter = footnoteFormatter || this.footnoteFormatter

    const tables = Array.prototype.slice
      .call(document.querySelectorAll(this.tableSelector))
      .filter((table) => {
        if (!this.excludeTableSelector) return true

        const finding = table.querySelector(this.excludeTableSelector)

        if (!!finding) return false

        return true
      })

    new XTableNamer()

    tables.forEach((table) => {
      if (this.checkTable(table)) {
        this.createWorkbook(table)
      }
    })
  }

  checkTable(table) {
    /*const TDs = Array.prototype.slice.call( table.querySelectorAll('tr:first-child > td') );
        let rt = true;
        TDs.forEach( td => {
          if(td.colSpan > 1) rt = false;
        } );*/
    return true
  }

  createWorkbook(table) {
    this.name = table.querySelector('[data-tableid]').dataset.tableid //if you have an error on this line replace data-tableid with data-table-id & tableid to tableId
    const workbook = new Excel.Workbook()
    this.worksheet = workbook.addWorksheet(this.name)
    this.fileName = this.tableTitle
    try {
      this.parseTable(table)
      this.parseFootnote(table)
      this.mergeCells(table)
      this.saveFile(this.fileName + '.xlsx', workbook)
    } catch (err) {
      alert(`Die Tabelle hat verbundene Zellen in der ersten Reihe, das wird nicht unterstützt vom XDownloader.
      Falls verbundene Zellen in der ersten Reihe benötigt werden bitte erste Zeile leer mit der Klasse .excel-download erfassen`)
      console.error(err)
    }
  }

  mergeCells(table) {
    this.mergeStrings = this.mergeStrings.filter((value, index) => {
      // console.log('merge string' + value, index, this.mergeStrings.indexOf(value))
      return this.mergeStrings.indexOf(value) === index
    })
    // console.log(this.mergeStrings);

    this.mergeStrings.forEach((s) => {
      try {
        this.worksheet.mergeCells(s.trim())
      } catch (error) {
        console.error(error)
      }
    })
  }

  /**
   * This one parses the footnotes and puts it after the table content in the worksheet
   * @param {*} table
   */
  parseFootnote(table) {
    const footnotes = document.querySelectorAll('.iz-keyfigure-comparison__footnote')
    this.worksheet.addRow([])
    footnotes.forEach((fn) => {
      let prettyFootnote = this.footnoteFormatter.call(this, fn)
      this.worksheet.addRow([prettyFootnote])
    })
  }

  footnoteFormatter(footnote) {
    return footnote.innerText.replace('\n', ' ')
  }

  getFileTitle(elem) {
    let name = elem.querySelector('[data-tableid]').dataset.tableid
    if (name) name = name.replaceAll(/\./g, '')
    return name
  }

  getTitle(elem) {
    return elem.closest(this.tableSelector).dataset.xTitle
  }

  htmlTableCellFormatter(td) {
    let cell = document.createElement('td')
    cell.innerHTML = td.innerHTML
    let superscript = cell.querySelector('.superscript')
    let superscriptContent = ''
    if (superscript) {
      superscriptContent = '(' + superscript.innerText + ')'
      superscript.parentNode.removeChild(superscript)
    }
    if (td.querySelector('.note__link')) {
      return this.correctNote(cell.innerText.trim() + ' ' + superscriptContent)
    } else {
      return this.correct(cell.innerText.trim() + ' ' + superscriptContent)
    }
  }

  /**
   * This one parses the table and puts it into the worksheet
   * @param {*} table
   */
  parseTable(table) {
    const t = table.querySelector('table')
    const rows = Array.prototype.slice.call(t.querySelectorAll('tr'))
    let row
    let content = []

    let counterR = 0
    let counterC = 0

    const title = this.getTitle(table)

    let styles = []

    this.setColumnWidhtByHeader(rows)

    rows.forEach((r) => {
      styles = []
      counterC = 0
      content = []
      counterR++ //counters to keep track where you are

      const tds = Array.prototype.slice.call(r.querySelectorAll('td'))

      tds.forEach((t) => {
        //second iteration for actual content
        counterC++

        styles[counterC] = this.getStyles(t) // get styles based on classes of the td
        let c = this.tableCellFormatter.call(this, t)

        if (isNaN(c)) {
          c = c
        } else {
          if (c == '\u00A0' || c.trim() == '') {
            //apparently this is still considered not NaN
            c = c
          } else {
            c = parseFloat(c)
          }
        }
        // console.log(c);
        content.push(c)
        const colspan = parseInt(styles[counterC].colspan)
        // console.log(t.innerText, colspan)
        if (colspan > 1) {
          for (let i = 1; i < colspan; i++) {
            content.push('')
            counterC++
          }
        }
      })

      this.worksheet.addRow(content)
      row = this.worksheet.lastRow

      for (let i = 1; i < styles.length; i++) {
        if (!!styles[i]) {
          if (!!styles[i].alignment) {
            row.getCell(i).alignment = styles[i].alignment
          }
          if (!!styles[i].border) {
            row.getCell(i).border = styles[i].border
            // console.log(styles[i].border)
          }
          if (!!styles[i].font) {
            row.getCell(i).font = styles[i].font
          }
          if (!!styles[i].fill) {
            row.getCell(i).fill = styles[i].fill
            // console.log(i, styles[i].fill.fgColor)
          }
          let colspan = parseInt(styles[i].colspan)
          // console.log(counterR, colspan)

          if (colspan > 1) {
            const mergeString =
              this.getLetter(i) +
              (counterR + (!this.tableTitle ? 1 : 4)) +
              ':' +
              this.getLetter(i + colspan - 1) +
              (counterR + (!this.tableTitle ? 1 : 4))
            this.mergeStrings.push(mergeString)
          }
        }

        if (!!this.numFmt) {
          this.numFmt.call(this, row.getCell(i), i, counterR)
        }
      }
    })
  }

  setColumnWidhtByHeader(rows) {
    const headerClasses = [
      'excel_download',
      ...this.styles.filter((item) => item.head).map((item) => item.class)
    ]
    let isHeader = false
    let first = true
    let content = []
    let headerRow = null
    let exceldownload = rows.filter((row) => row.classList.contains('excel_download'))

    if (!!exceldownload[0]) {
      headerRow = exceldownload[0]
    } else {
      rows.forEach((r) => {
        if (first) {
          headerClasses.forEach((item) => {
            if (r.classList.contains(item)) isHeader = true
            headerRow = r
          })
        }
      })
    }

    if (headerRow) {
      first = false

      const tds = Array.prototype.slice.call(headerRow.querySelectorAll('td'))

      tds.forEach((t) => {
        //first iteration for header column without content to set widths of columns
        content.push({
          header: ' ',
          key: 'id',
          width: t.offsetWidth / 7
        })
      })
      this.worksheet.columns = content

      content = []

      let row = this.worksheet.lastRow
      row.height = 0.5

      if (this.tableTitle) {
        let title = ''
        if (typeof this.tableTitle == 'string') {
          title = this.tableTitle
        } else if (typeof this.tableTitle == 'function') {
          title = this.tableTitle.call(this, table)
        }

        this.worksheet.addRow([])

        this.worksheet.addRow([title])
        row = this.worksheet.lastRow

        row.getCell('A').font = {
          size: 16,
          bold: true
        }

        this.worksheet.addRow([])
      }
    } else {
      return
    }
  }

  /**
   * check for classes and return the right styles
   * can be extended
   * @param {*} t
   */
  getStyles(t) {
    let r = []

    const styles = this.styles
      .filter((style) => {
        return t.classList.contains(style.class)
      })
      .sort((a, b) => {
        // sort index of importance lowest first
        if (a.index < b.index) {
          return 1
        }

        if (a.index > b.index) {
          return -1
        }

        return 0
      })

    if (t.classList.contains('ns-horizontal-left')) {
      r.alignment = { horizontal: 'left', wrapText: true }
    }
    if (t.classList.contains('ns-horizontal-right')) {
      r.alignment = { horizontal: 'right', wrapText: true }
    }
    if (t.classList.contains('ns-horizontal-center')) {
      r.alignment = { horizontal: 'center', wrapText: true }
    }

    // merge all styles, most important style is applied last
    if (styles.length > 0) {
      styles.forEach((style) => {
        r = {
          ...r,
          ...style,
          class: undefined, // remove classes
          head: undefined,
          index: undefined
        }
      })
    }

    // if no border style set
    if ((!'border') in r) {
      // console.log(r)
      r.border = {}
    }

    // when no fill set, default to white to hide lines
    if (!!!r.fill || !!!r.fill.fgColor) {
      r.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: 'FFFFFFFF'
        }
      }
    }

    r.colspan = t.colSpan

    return r
  }

  /**
   * savefile doesnt need explanation as well
   * @param {*} fileName
   * @param {*} workbook
   */
  async saveFile(fileName, workbook) {
    const xls64 = await workbook.xlsx.writeBuffer({
      base64: true
    })
    saveAs(
      new Blob([xls64], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }),
      fileName
    )
  }

  /**
   * delete the thousand marks and replace false minus with right one
   */
  correct(text) {
    return text
      .replace(/'/g, '')
      .replace(/’/g, '')
      .replace(/–/g, '-')
      .replace(/,/g, '.')
      .replace(/–/g, '-')
      .replace(/,/g, '.')
  }

  correctNote(text) {
    return text.replace(/'/g, '').replace(/’/g, '').replace(/–/g, '-')
  }

  getLetter(number) {
    const letters = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z'
    ]
    return letters[number - 1]
  }

  getEnvironement() {
    const body = document.querySelector('body')
    if (body.classList.contains('wp-production')) {
      return 'production'
    } else {
      return 'stage'
    }
  }
}

export default XDownloader
