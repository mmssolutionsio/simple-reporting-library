import '#imports/pdf.scss'
import * as Awesomizr from 'srl/Awesomizr.js'
import PDFNotes from '@/entries/pdf/PDFNotes.ts'
import PDFSetPageNumbers from '@/entries/pdf/PDFSetPageNumbers.ts';

document.addEventListener('DOMContentLoaded', () => {
  new PDFNotes({
    noteClass: '.srl-category-notes_group, .srl-category-notes_holding'
  })

  new PDFSetPageNumbers({
    tocItemClass: '.srl-pdf-toc__item:not(.srl-pdf-toc__item--blank)',
    tocItemPageNumberClass: '.srl-pdf-toc__number'
  });
})