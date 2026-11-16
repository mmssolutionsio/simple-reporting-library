import '#imports/pdf.scss'
import pdfPageRules from '#imports/pdf.scss?srl-page-rules'
import * as Awesomizr from 'srl/pdf/Awesomizr.js'
import PDFNotes from 'srl/pdf/PDFNotes.ts'
import PDFNestedContainers from 'srl/pdf/PDFNestedContainers.ts'
import PDFSetPageNumbers from 'srl/pdf/PDFSetPageNumbers.ts'
import PDFPageReferenceColors from 'srl/pdf/PDFPageReferenceColors.ts'

document.addEventListener('DOMContentLoaded', () => {
  const noteClass = '.srl-category-notes_group, .srl-category-notes_holding'
  if (document.querySelector(noteClass)) {
    new PDFNotes({ noteClass })
  }

  new PDFNestedContainers({
    selector: '.srl-nested-container'
  })

  new PDFSetPageNumbers({
    tocItemClass: '.srl-pdf-toc__item:not(.srl-pdf-toc__item--blank)',
    tocItemPageNumberClass: '.srl-pdf-toc__page-number'
  })
})

window.addEventListener('load', () => PDFPageReferenceColors(pdfPageRules))
