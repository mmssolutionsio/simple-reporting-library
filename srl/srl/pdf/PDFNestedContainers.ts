export interface PDFNestedContainerMarkerConfig {
  selector?: string
}

export default class PDFNestedContainers {
  private containers: NodeListOf<HTMLElement>

  private excludedClasses = ['srl-grid', 'srl-linkable', 'srl-nested-container']

  private wrapperClasses = ['srl-grid']

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

      const firstClass = firstElement ? this.getRelevantClass(firstElement) : null
      const lastClass = lastElement ? this.getRelevantClass(lastElement) : null

      if (firstClass) {
        container.classList.add(`${firstClass}-first`)
      }

      if (lastClass) {
        container.classList.add(`${lastClass}-last`)
      }
    })
  }

  private findEdgeElement(root: HTMLElement, direction: 'first' | 'last'): HTMLElement | null {
    const children = Array.from(root.children) as HTMLElement[]

    const orderedChildren = direction === 'first' ? children : [...children].reverse()

    for (const child of orderedChildren) {
      if (this.isLayoutWrapper(child)) {
        const nestedElement = this.findEdgeElement(child, direction)

        if (nestedElement) {
          return nestedElement
        }

        continue
      }

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

  private getRelevantClass(el: HTMLElement): string | null {
    const classes = Array.from(el.classList)

    const relevant = classes.find((cls) => {
      if (!cls.startsWith('srl-')) return false
      if (this.excludedClasses.includes(cls)) return false
      if (cls.includes('__')) return false
      if (this.wrapperClasses.includes(cls)) return false
      if (cls.endsWith('-first')) return false
      if (cls.endsWith('-last')) return false

      return true
    })

    return relevant || null
  }
}
