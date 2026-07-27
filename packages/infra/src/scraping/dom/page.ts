// import xmlser from 'xmlserializer';
// import xdom from '@xmldom/xmldom';
import jsdom from 'jsdom'
import { DOMElement, GenericElement } from './element.js'
// import * as parse5 from 'parse5';

// import xpath from 'xpath';

/**
 * Defines an option to create a Page from a Response object.
 */
export type PageResponseOption = {
  kind: 'response'
  response: Response
}

/**
 * Defines an option to create a Page from an HTML string.
 */
export type PageTextOption = {
  kind: 'html'
  htmlText: string
}

/**
 * Represents the configuration options for initializing a Page.
 */
export type PageOption = PageResponseOption | PageTextOption

/**
 * Represents a web page document parsed from a response or raw HTML content.
 */
export class Page {
  /**
   * The internal HTTP response object, if initialized from a network request.
   */
  readonly #response: Response | undefined
  // readonly #dom: JSDOM;

  /**
   * The internal document representation of the page content.
   */
  #xdoc: Document

  /**
   * The raw HTML source string of the page.
   */
  #htmlString: string

  /**
   * Initializes a new Page instance from the provided options.
   *
   * @param option Configuration object providing either a response or raw HTML text.
   */
  constructor(option: PageOption) {
    if (option.kind === 'response') {
      this.#response = option.response
      this.#htmlString = ''
    } else {
      this.#htmlString = option.htmlText
    }
    const document = new jsdom.JSDOM(this.#htmlString)
    // const doc = parse5.parse(this.#htmlString);
    // const xhtml = xmlser.serializeToString(doc as any as Node);
    // //const xhtml = serialize(document);
    // console.log(xhtml);
    this.#xdoc = document.window.document // new xdom.DOMParser().parseFromString(xhtml);
    // this.#dom = new JSDOM(response.data as string);
    // this.#dom.window.document.evaluate;
  }

  /**
   * Creates a new Page instance from a Fetch Response.
   *
   * @param response The HTTP response object.
   *
   * @returns A promise resolving to the created Page instance.
   */
  static async createFromResponse(response: Response) {
    const page = new Page({ kind: 'response', response })
    page.#htmlString = await response.text()
    const document = new jsdom.JSDOM(page.#htmlString)
    page.#xdoc = document.window.document
    return page
  }

  /**
   * Retrieves an element by its ID and wraps it in a GenericElement.
   *
   * @param id The unique ID of the element to find.
   *
   * @returns The found element wrapped as a GenericElement, or undefined if no such element exists.
   */
  getElementById<T extends HTMLElement>(id: string) {
    const element = this.#xdoc.getElementById(id)

    if (!element) return undefined
    return new GenericElement<T>(element as T)
  }

  /**
   * Retrieves all DOM elements with the specified class name.
   *
   * @param className The class name to filter by.
   *
   * @returns An array of DOMElement instances matching the class name.
   */
  getDOMElementsByClassName(className: string) {
    return (
      Array.from(this.#xdoc.getElementsByClassName(className))
        // .filter((value) => {
        //   if (!value || !(value as HTMLElement)) return false;
        //   return true;
        // })
        .map((e) => new DOMElement(e as HTMLElement))
    )
  }

  /**
   * Retrieves all elements with the specified class name, wrapped as GenericElements.
   *
   * @param className The class name to filter by.
   *
   * @returns An array of GenericElement instances matching the class name.
   */
  getElementsByClassName<T extends HTMLElement>(className: string) {
    // const elementArray = new Array<HTMLElement>();
    return Array.from(this.#xdoc.getElementsByClassName(className)).map(
      (e) => new GenericElement<T>(e as T),
    )
    // return elementArray;
  }

  /**
   * Returns the raw HTML string of the page.
   *
   * @returns The HTML content as a string.
   */
  get html(): string {
    return this.#htmlString
  }

  /**
   * Performs an XPath search and returns all matching elements.
   *
   * @param path The XPath query string.
   *
   * @returns A NodeList containing all matching elements.
   */
  searchByXPath(path: string) {
    // return xpath.select(path, this.#xdoc).map((v) => {
    //   return DOMElement.parseXPathResultValidValue(v);
    // });
    return this.#xdoc.querySelectorAll(path)
  }

  /**
   * Performs an XPath search and returns the first matching element.
   *
   * @param path The XPath query string.
   *
   * @returns The first matching element, or null if not found.
   */
  searchOneByXPath(path: string) {
    return this.#xdoc.querySelector(path)
    // const searchValue = xpath.select(path, this.#xdoc, true);
    // return DOMElement.parseXPathResultValue(searchValue);
  }

  /**
   * Retrieves the document title, derived from the Content-Disposition header or the title element.
   *
   * @returns The document title, or undefined if it could not be determined.
   */
  get title() {
    let fileName
    if (this.#response) {
      if ('Content-Disposition' in this.#response.headers) {
        let headerValue = this.#response.headers['Content-Disposition'] as string | Array<string>
        if (headerValue) {
          if (Array.isArray(headerValue) && headerValue.length > 0 && headerValue[0]) {
            headerValue = headerValue[0]
          }
          fileName = decodeURI(
            (headerValue as string).substring(headerValue.indexOf('filename=') + 9),
          )
        }
      }
    }
    if (!fileName) {
      const titleElements = this.#xdoc.getElementsByTagName('title')

      if (titleElements.length > 0) {
        console.log(titleElements.item(0))
        const titleElement = titleElements.item(0) as HTMLTitleElement
        fileName = titleElement.textContent
      }
    }
    return fileName
  }
  // save(directoryName: string) {
  //   let fileName;
  //   if (!!this.#response) {
  //     if ('Content-Disposition' in this.#response.headers) {
  //       const headerValue = this.#response.headers['Content-Disposition'];
  //       fileName = decodeURI(
  //         headerValue.substring(headerValue.indexOf('filename=') + 9)
  //       );
  //     }
  //   }
  //   if (!fileName) {
  //     const titleElements = this.#xdoc.getElementsByTagName('title');
  //     if (titleElements.length > 0) {
  //       const titleElement = titleElements.item(0) as HTMLTitleElement;
  //       fileName = titleElement.innerText;
  //     }
  //   }

  //   fileName = tmpNameSync({
  //     dir: directoryName,
  //     template: fileName ?? 'unknownFile' + '-XXXXXX.html',
  //   });
  //   this.saveas(fileName);
  // }
  // saveas(fileName: string) {
  //   writeFileSync(fileName, this.html);
  // }
}
