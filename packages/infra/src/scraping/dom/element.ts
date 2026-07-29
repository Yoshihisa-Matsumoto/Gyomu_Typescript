import { Attribute } from './attribute.js'
// import xpath from 'xpath';

/**
 * Represents a wrapper around an HTMLElement providing utilities for DOM traversal and attribute access.
 */
export class DOMElement {
  /**
   * The underlying DOM element.
   */
  protected __node: HTMLElement

  /**
   * Constructs a new DOMElement instance from an HTMLElement.
   */
  constructor(node: HTMLElement) {
    this.__node = node
  }

  /**
   * Returns a list of direct child elements wrapped as DOMElement instances.
   *
   * @returns An array of DOMElement instances.
   */
  get childElements(): Array<DOMElement> {
    const children = new Array<DOMElement>()
    const win = this.__node.ownerDocument.defaultView

    for (const child of Array.from(this.__node.childNodes)) {
      if (win && child instanceof win.HTMLElement) {
        const childElement = new DOMElement(child)
        children.push(childElement)
      }
    }
    return children
  }

  /**
   * Retrieves the underlying node cast to the specified HTMLElement subtype.
   *
   * @returns The underlying node.
   */
  protected getNode<E extends HTMLElement>(): E {
    return this.__node as E
  }

  /**
   * Returns the ID of the underlying element.
   *
   * @returns The ID string.
   */
  get id(): string {
    return this.__node.id
  }

  /**
   * Returns the innerHTML of the underlying element.
   *
   * @returns The HTML content string.
   */
  get innerHtml(): string {
    return this.__node.innerHTML
  }

  /**
   * Returns the text content of the underlying element.
   *
   * @returns The text content string.
   */
  get innerText(): string {
    return this.__node.textContent || this.childNodeValue
  }

  /**
   * Returns the nodeValue of the first child node, if it exists.
   *
   * @returns The child node value or an empty string.
   */
  get childNodeValue(): string {
    const cnodes = this.__node.childNodes
    return cnodes.length > 0 ? (cnodes.item(0).nodeValue ?? '') : ''
  }

  /**
   * Returns the class names of the element as an array.
   *
   * @returns An array of class name strings.
   */
  get classList(): Array<string> {
    const classArray = new Array<string>()
    this.__node.classList.forEach((val) => {
      classArray.push(val)
    })
    return classArray
  }

  /**
   * Returns all attributes of the element.
   *
   * @returns An array of Attribute instances.
   */
  get attributes(): Array<Attribute> {
    const attributeArray = new Array<Attribute>()
    const nodeAttributes = this.__node.attributes
    for (let i = 0; i < nodeAttributes.length; i++) {
      const nodeAttribute = nodeAttributes.item(i)
      if (nodeAttribute) {
        const attribute: Attribute = new Attribute(nodeAttribute)
        attributeArray.push(attribute)
      }
    }
    return attributeArray
  }

  /**
   * Retrieves a specific attribute by its name.
   *
   * @param name The name of the attribute.
   *
   * @returns The attribute, or undefined if not found.
   */
  getAttribute(name: string): Attribute | undefined {
    const nodeAttribute = this.__node.attributes.getNamedItem(name)
    if (!nodeAttribute) return undefined
    else return new Attribute(nodeAttribute)
  }

  /**
   * Queries the element for nodes matching the specified CSS selector path.
   *
   * @param path The CSS selector string.
   *
   * @returns A NodeList containing the matching elements.
   */
  searchByXPath(path: string) {
    // return xpath.select(path, this.__node).map((v) => {
    //   return DOMElement.parseXPathResultValidValue(v);
    // });
    return this.__node.querySelectorAll(path)
  }

  /**
   * Queries the element for the first node matching the specified CSS selector path.
   *
   * @param path The CSS selector string.
   *
   * @returns The first matching element, or null.
   */
  searchOneByXPath(path: string) {
    // const searchValue = xpath.select(path, this.__node, true);
    // return DOMElement.parseXPathResultValue(searchValue);
    return this.__node.querySelector(path)
  }

  // static parseXPathResultValue(searchValue: xpath.SelectedValue | undefined) {
  //   if (!searchValue) return undefined;
  //   return DOMElement.parseXPathResultValidValue(searchValue);
  // }
  // static parseXPathResultValidValue(searchValue: xpath.SelectedValue) {
  //   switch (typeof searchValue) {
  //     case 'string':
  //       return searchValue as string;
  //     case 'number':
  //       return searchValue as number;
  //     case 'boolean':
  //       return searchValue as boolean;
  //     default:
  //       if (searchValue instanceof Attr) {
  //         return new Attribute(searchValue);
  //       } else {
  //         if (searchValue instanceof HTMLElement) {
  //           return new GenericElement<HTMLElement>(searchValue);
  //         } else {
  //           throw new WebParseError(
  //             `Unsupported Value: ${JSON.stringify(searchValue)}`
  //           );
  //         }
  //       }
  //   }
  // }
}

/**
 * A type-safe extension of DOMElement that provides access to the underlying element as a specific HTMLElement type.
 */
export class GenericElement<T extends HTMLElement> extends DOMElement {
  /**
   * Constructs a new GenericElement instance from an HTMLElement of type T.
   */
  constructor(node: T) {
    super(node)
  }

  /**
   * Returns the underlying node as the generic type T.
   *
   * @returns The underlying node.
   */
  get node(): T {
    return this.__node as T
  }

  /**
   * Queries child elements by tag name and returns them wrapped as GenericElement instances.
   *
   * @param qualifiedName The tag name to search for.
   *
   * @returns An array of wrapped elements matching the tag name.
   */
  getGenericElementsByTagName<K extends keyof HTMLElementTagNameMap>(qualifiedName: K) {
    return Array.from(this.__node.getElementsByTagName<K>(qualifiedName)).map((element) => {
      return new GenericElement<HTMLElementTagNameMap[K]>(element)
    })
  }
}
