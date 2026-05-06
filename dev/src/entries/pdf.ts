import '#imports/pdf.scss'
import * as Awesomizr from 'srl/pdf/Awesomizr.js'
import PDFNotes from 'srl/pdf/PDFNotes.ts'
import PDFNestedContainers from 'srl/pdf/PDFNestedContainers.ts'
import PDFSetPageNumbers from 'srl/pdf/PDFSetPageNumbers.ts'

document.addEventListener('DOMContentLoaded', () => {
  new PDFNotes({
    noteClass: '.srl-category-notes_group, .srl-category-notes_holding'
  })

  new PDFNestedContainers({
    selector: '.srl-nested-container'
  })

  new PDFSetPageNumbers({
    tocItemClass: '.srl-pdf-toc__item:not(.srl-pdf-toc__item--blank)',
    tocItemPageNumberClass: '.srl-pdf-toc__page-number'
  })
})
