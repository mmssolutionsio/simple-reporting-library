/**
 * Exceldownload working with NSWOW2 Tables
 */
class XTableNamer {
  constructor() {
    const elements = Array.prototype.slice.call(
      document.querySelectorAll(
        '.content .ns-table-wrap, .content .ns-title-h1, .content .ns-title-h2, .content .accordion-title'
      )
    )
    let h1
    let h2
    let c
    const pageTitle = document.querySelector('.header__top-title')

    elements.forEach((element) => {
      const className = element.classList[0]

      switch (className) {
        case 'ns-title-h1':
          const span = element
          if (!!span) {
            h1 = span.innerText
          }
          c = 0
          break
        case 'ns-title-h2':
          if (!!element.innerText.trim()) {
            h2 = element.innerText
            c = 0
          }
          break
        case 'accordion-title':
          const spanL = element.querySelector('span:last-child')
          if (!!spanL.innerText.trim()) {
            h2 = spanL.innerText
            c = 0
          }
          break
        case 'ns-table-wrap':
          let title = ''
          let fileTitle = ''
          if (!!pageTitle) {
            title += pageTitle.innerText + ' – '
          }
          if (!!h1) {
            title += h1.trim()
          }
          if (!!h2) {
            title += ' - ' + h2.trim()
            fileTitle += h2.trim().replace(/\s/g, '_')
          } else {
            fileTitle += h1.trim().replace(/\s/g, '_')
          }
          if (c > 0) {
            title += ' ' + (c + 1)
            fileTitle += '_' + (c + 1)
          }
          element.dataset.xTitle = title
          element.dataset.xFileTitle = fileTitle
          c++
          break
      }
      // ifelement.
    })
  }
}
export default XTableNamer
