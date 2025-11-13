import '#imports/pdf.scss'
import * as Awesomizr from 'srl/pdf/Awesomizr.js'
import * as PDFNotes from 'srl/pdf/PDFNotes.ts'
import * as PDFSetPageNumbers from 'srl/pdf/PDFSetPageNumbers.ts';

document.addEventListener('DOMContentLoaded', () => {
  new PDFNotes({
    noteClass: '.srl-category-notes_group, .srl-category-notes_holding'
  })

  new PDFSetPageNumbers({
    tocItemClass: '.srl-pdf-toc__item:not(.srl-pdf-toc__item--blank)',
    tocItemPageNumberClass: '.srl-pdf-toc__number'
  });
})