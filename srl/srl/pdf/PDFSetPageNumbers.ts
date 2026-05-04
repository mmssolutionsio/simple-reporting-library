export interface PDFSetPageNumbersConfig {
  tocItemClass: string;
  tocItemPageNumberClass: string;
}

export class PDFSetPageNumbers {
  private tocItems: NodeListOf<HTMLElement>;
  private pageNumberClass: string;

  constructor(config: PDFSetPageNumbersConfig) {
    const { tocItemClass, tocItemPageNumberClass } = config;

    this.tocItems = document.querySelectorAll(tocItemClass);
    this.pageNumberClass = tocItemPageNumberClass;

    this.tocItems.forEach(item => {
      const link = item.getAttribute('href');
      const num = item.querySelector<HTMLElement>(this.pageNumberClass);

      if (num && link) {
        num.setAttribute('data-page-number', link);
      }
    });
  }
}

export default PDFSetPageNumbers