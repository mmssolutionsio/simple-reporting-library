export interface PDFNotesConfig {
  noteClass: string
}

export class PDFNotes {
  private notesArticles!: NodeListOf<HTMLElement>
  private selectors: string[] = []

  private excludedClasses = [
    'srl-grid',
    'srl-linkable',
    'srl-editor-component',
    'srl-pdf-columnbreak',
    'srl-flex',
    'srl-flex-gap',
  ]

  private wrapperClasses = ['srl-grid', 'srl-flex', 'srl-flex-gap']

  constructor(config: PDFNotesConfig) {
    const { noteClass } = config

    if (!noteClass) {
      console.warn("PDFNotes: 'noteClass' ist erforderlich.")
      return
    }

    this.selectors = noteClass
        .split(',')
        .map((selector) => selector.trim())
        .filter(Boolean)

    this.notesArticles = document.querySelectorAll(noteClass)

    if (this.notesArticles.length === 0) {
      console.warn(`PDFNotes: Keine Elemente gefunden mit Selektor '${noteClass}'.`)
      return
    }

    this.markLastNotePerSelector()
    this.setFirstAndLastNoteClass()
  }

  private setFirstAndLastNoteClass(): void {
    this.notesArticles.forEach((container) => {
      const firstElement = this.findEdgeElement(container, 'first')
      const lastElement = this.findEdgeElement(container, 'last')

      const firstClasses = firstElement
          ? this.getRelevantClasses(firstElement)
          : []
      const lastClasses = lastElement ? this.getRelevantClasses(lastElement) : []

      firstClasses.forEach((firstClass) => {
        container.classList.add(`${firstClass}-first`)
      })

      lastClasses.forEach((lastClass) => {
        container.classList.add(`${lastClass}-last`)
      })
    })
  }

  private markLastNotePerSelector(): void {
    if (!this.selectors || this.selectors.length === 0) return

    this.selectors.forEach((selector) => {
      const nodes = document.querySelectorAll<HTMLElement>(selector)
      if (nodes.length === 0) return

      const last = nodes[nodes.length - 1]
      last.classList.add('last-note')
    })
  }

  private findEdgeElement(
      root: HTMLElement,
      direction: 'first' | 'last',
  ): HTMLElement | null {
    const children = Array.from(root.children) as HTMLElement[]
    const orderedChildren =
        direction === 'first' ? children : [...children].reverse()

    for (const child of orderedChildren) {
      const relevantClass = this.getRelevantClass(child)

      if (relevantClass) {
        return child
      }

      const nestedElement = this.findEdgeElement(child, direction)

      if (nestedElement) {
        return nestedElement
      }
    }

    return null
  }

  private getRelevantClass(el: HTMLElement): string | null {
    return this.getRelevantClasses(el)[0] || null
  }

  private getRelevantClasses(el: HTMLElement): string[] {
    const classes = Array.from(el.classList)

    const marginGroupClass = classes.find((cls) =>
        cls.startsWith('srl-margin-group-'),
    )

    const relevant = classes.find((cls) => {
      if (!cls.startsWith('srl-')) return false
      if (this.excludedClasses.includes(cls)) return false
      if (cls.startsWith('srl-margin-group-')) return false
      if (cls.includes('__')) return false
      if (this.wrapperClasses.includes(cls)) return false
      if (cls.endsWith('-first')) return false
      if (cls.endsWith('-last')) return false
      if (cls.startsWith('srl-text-alignment-')) return false

      return true
    })

    return [marginGroupClass, relevant].filter(
        (cls, index, list): cls is string =>
            Boolean(cls) && list.indexOf(cls) === index,
    )
  }
}

export default PDFNotes
