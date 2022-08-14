import { Attribute } from './attribute';
import xpath from 'xpath';
import { WebParseError } from '../errors';
import { parseXPathResultValidValue, parseXPathResultValue } from './util';

export class DOMElement {
  protected __node: HTMLElement;

  constructor(node: HTMLElement) {
    this.__node = node;
  }

  get childElements(): Array<DOMElement> {
    const children = new Array<DOMElement>();
    for (var child of Array.from(this.__node.childNodes)) {
      if (child instanceof HTMLElement) {
        const childElement = new DOMElement(child);
        children.push(childElement);
      }
    }
    return children;
  }

  protected getNode<E extends HTMLElement>(): E {
    return this.__node as E;
  }

  get id(): string {
    return this.__node.id;
  }
  get innerHtml(): string {
    return this.__node.innerHTML;
  }
  get innerText(): string {
    return this.__node.textContent ?? this.childNodeValue;
  }
  get childNodeValue(): string {
    const cnodes = this.__node.childNodes;
    return cnodes.length > 0 ? cnodes.item(0).nodeValue ?? '' : '';
  }
  get classList(): string[] {
    let classArray = new Array<string>();
    this.__node.classList.forEach((val) => {
      classArray.push(val);
    });
    return classArray;
  }
  get attributes(): Array<Attribute> {
    const attributeArray = new Array<Attribute>();
    const nodeAttributes = this.__node.attributes;
    for (let i = 0; i < nodeAttributes.length; i++) {
      const nodeAttribute = nodeAttributes.item(i);
      if (!!nodeAttribute) {
        const attribute: Attribute = new Attribute(nodeAttribute);
        attributeArray.push(attribute);
      }
    }
    return attributeArray;
  }
  getAttribute(name: string): Attribute | undefined {
    const nodeAttribute = this.__node.attributes.getNamedItem(name);
    if (!nodeAttribute) return undefined;
    else return new Attribute(nodeAttribute);
  }
  getGenericElementsByTagName<K extends keyof HTMLElementTagNameMap>(
    qualifiedName: K
  ) {
    return Array.from(this.__node.getElementsByTagName<K>(qualifiedName)).map(
      (element) => {
        return new GenericElement<HTMLElementTagNameMap[K]>(element);
      }
    );
  }
  searchByXPath(path: string) {
    return xpath.select(path, this.__node).map((v) => {
      return parseXPathResultValidValue(v);
    });
  }

  searchOneByXPath(path: string) {
    const searchValue = xpath.select(path, this.__node, true);
    return parseXPathResultValue(searchValue);
  }
}

export class GenericElement<T extends HTMLElement> extends DOMElement {
  constructor(node: T) {
    super(node);
  }
  get node(): T {
    return this.__node as T;
  }
}
