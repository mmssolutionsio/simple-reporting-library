export interface PDFNestedContainerMarkerConfig {
  selector?: string
}

export class PDFNestedContainers {
  private containers: NodeListOf<HTMLElement>

  private excludedClasses = [
    'srl-grid',
    'srl-linkable',
    'srl-nested-container',
    'srl-editor-component',
    'srl-pdf-columnbreak',
    'srl-flex',
    'srl-flex-gap',
  ]

  private wrapperClasses = ['srl-grid', 'srl-flex', 'srl-flex-gap']

  constructor(config: PDFNestedContainerMarkerConfig = {}) {
    const { selector = '.srl-nested-container' } = config

    this.containers = document.querySelectorAll(selector)

    if (this.containers.length === 0) {
      return
    }

    this.markContainers()
  }

  private markContainers(): void {
    this.containers.forEach((container) => {
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

  private findEdgeElement(
    root: HTMLElement,
    direction: 'first' | 'last',
  ): HTMLElement | null {
    const searchRoot = this.getEdgeSearchRoot(root)
    const children = Array.from(searchRoot.children) as HTMLElement[]
    const orderedChildren =
      direction === 'first' ? children : [...children].reverse()

    for (const child of orderedChildren) {
      const relevantClass = this.getRelevantClass(child)

      if (relevantClass) {
        return child
      }

      if (this.isLayoutWrapper(child)) {
        const nestedElement = this.findEdgeElement(child, direction)

        if (nestedElement) {
          return nestedElement
        }

        continue
      }

      const nestedElement = this.findEdgeElement(child, direction)

      if (nestedElement) {
        return nestedElement
      }
    }

    return null
  }

  private getEdgeSearchRoot(root: HTMLElement): HTMLElement {
    if (!this.hasClass(root, 'srl-aside-content-container')) {
      return root
    }

    const content = Array.from(root.children).find((child) =>
      this.hasClass(
        child as HTMLElement,
        'srl-aside-content-container__content',
      ),
    ) as HTMLElement | undefined

    return content || root
  }

  private isLayoutWrapper(el: HTMLElement): boolean {
    const classes = Array.from(el.classList)

    if (classes.some((cls) => this.wrapperClasses.includes(cls))) {
      return true
    }

    if (classes.some((cls) => cls.includes('__'))) {
      return true
    }

    if (el.hasAttribute('doc-container') && !this.getRelevantClass(el)) {
      return true
    }

    return false
  }

  private hasClass(el: HTMLElement, className: string): boolean {
    return Array.from(el.classList).includes(className)
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

export default PDFNestedContainers
