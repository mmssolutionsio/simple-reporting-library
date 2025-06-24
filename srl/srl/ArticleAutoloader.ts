import { camelCase } from '#utils';
import ArticleLoader from './ArticleLoader';

type AutoloadList = string | string[];

/**
 * Class representing an ArticleAutoloader.
 * @class
 */
class ArticleAutoloader {
  classes: { [key: string]: { new (node: HTMLElement, options: any): any } };
  selector: string;

  /**
   * Constructor for the class.
   * Initializes the "classes" and "selector" properties.
   *
   * @constructor
   */
  constructor() {
    this.classes = {};
    this.selector = '[data-autoload]';
  }

  /**
   * Initializes the Autoload feature on the specified HTMLElement.
   *
   * @param {HTMLElement} obj - The HTMLElement on which to initialize Autoload.
   * @return {void}
   */
  init(obj: HTMLElement) {
    const nodes: NodeListOf<Element> = obj.querySelectorAll(this.selector);
    if (nodes) {
      for (let index = 0; index < nodes.length; index++) {
        this._initAutoload(nodes[index] as HTMLElement);
      }
    }
  }

  /**
   * Registers the provided object class with the given class name.
   *
   * @param {ArticleLoader} objClass - The object class to register.
   * @param {string} className - The name to associate with the object class.
   */
  register(objClass: ArticleLoader, className: string) {
    this.classes[camelCase(className)] = objClass;
  }

  /**
   * Creates an instance of a class based on the given class name and initializes it with the provided options.
   *
   * @param {HTMLElement} node - The HTML element to which the class instance will be attached.
   * @param {Object} options - The options to be passed to the class instance during initialization.
   * @param {string} className - The name of the class to be instantiated.
   *
   * @return {void} - This method does not return any value.
   */
  _createInstance(node: HTMLElement, options: any, className: string) {
    if (this.classes[className] !== undefined) {
      new this.classes[className](node, options);
    }
  }

  /**
   * Initializes the autoload feature for the given node.
   *
   * @param {HTMLElement} node - The node for which to initialize the autoload feature.
   */
  _initAutoload(node: HTMLElement): void {
    let load: AutoloadList = node.dataset.autoload;

    // Converting to array in case of single string for uniform processing
    try {
      load = JSON.parse(load);
    } catch (e) {
      load = load.split(' ');
    }

    if (typeof load === 'string') {
      load = [load];
    }
    // check if it's a single string or a list
    if (load.length === 1) {
      const options = node.dataset.options || {};
      this._createInstance(node, options, camelCase(load[0]));
    } else {
      const optionsDataSet = JSON.parse(node.dataset.options || '{}');
      for (const className of load) {
        if (className !== '') {
          const options = optionsDataSet[className] || {};
          this._createInstance(node, options, camelCase(className));
        }
      }
    }
  }
}

export default ArticleAutoloader;
export { ArticleAutoloader };
