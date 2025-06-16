/**
 * A class for loading articles into elements.
 * @class
 */
abstract class ArticleLoader {
  protected element: HTMLElement
  protected options: { key: string; value: any }

  /**
   * Constructs a new instance of the class.
   *
   * @param {string | Node} selector - The CSS selector or Node object to initialize the class with.
   * @param {any} options - Optional options to pass to the class.
   * @constructor
   */
  protected constructor(selector: string | Node, options: { key: string; value: any } | undefined) {
    if (typeof selector === 'string' || selector instanceof NodeList) {
      this._initializeNodeList(selector, options)
    } else if (selector instanceof Node) {
      this.element = selector as HTMLElement
      this.element[this.constructor.name] = this
      this._initializeNode(selector, options)
    }
  }

  /**
   * Initializes a node list with a given selector or NodeList object.
   *
   * @param {string | NodeList} selector - The selector or NodeList object used to initialize the node list.
   * @param {unknown} options - Optional options to be passed to the constructor of each node in the node list.
   *
   * @return {void} - No return value.
   */
  private _initializeNodeList(selector: string | NodeList, options: unknown) {
    const nodeList = typeof selector === 'string' ? document.querySelectorAll(selector) : selector
    Array.from(nodeList).forEach((node) => new this.constructor(node, options))
  }

  /**
   * Initializes a Node object with given options.
   *
   * @param {Node} node - The Node to initialize.
   * @param {unknown} options - The options to assign to the Node.
   * @return {void}
   */
  private _initializeNode(node: Node, options: unknown) {
    this._assignOptions(options)
    this._create()
  }

  /**
   * Assigns options to a class property.
   *
   * @param {unknown} options - The options to be assigned.
   * @return {void}
   */
  private _assignOptions(options: unknown) {
    if (options !== undefined) {
      this.options = typeof options === 'string' ? JSON.parse(options) : options
    } else {
      this.options = {}
    }
  }

  /**
   * Returns the options assigned to the class.
   * @return { key: string, value: any }
   */
  public getOptions() {
    return this.options
  }

  /**
   * Returns the element assigned to the class.
   * @return {HTMLElement}
   */
  public getElement() {
    return this.element
  }

  /**
   * Abstract method _create.
   *
   * This must be defined in any class extending ArticleLoader. It serves as the
   * entry point for the initialization of the abstraction.
   */
  abstract _create(): void
}

export default ArticleLoader
export { ArticleLoader }
