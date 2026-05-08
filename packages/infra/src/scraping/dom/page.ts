// import xmlser from 'xmlserializer';
// import xdom from '@xmldom/xmldom';
import { DOMElement, GenericElement } from './element.js';
// import * as parse5 from 'parse5';
import jsdom from 'jsdom';

// import xpath from 'xpath';

export type PageResponseOption = {
  kind: 'response';
  response: Response;
};
export type PageTextOption = {
  kind: 'html';
  htmlText: string;
};

export type PageOption = PageResponseOption | PageTextOption;

export class Page {
  readonly #response: Response | undefined;
  //readonly #dom: JSDOM;
  #xdoc: Document;
  #htmlString: string;
  constructor(option: PageOption) {
    if (option.kind === 'response') {
      this.#response = option.response;
      this.#htmlString = '';
    } else {
      this.#htmlString = option.htmlText;
    }
    const document = new jsdom.JSDOM(this.#htmlString);
    // const doc = parse5.parse(this.#htmlString);
    // const xhtml = xmlser.serializeToString(doc as any as Node);
    // //const xhtml = serialize(document);
    // console.log(xhtml);
    this.#xdoc = document.window.document; //new xdom.DOMParser().parseFromString(xhtml);
    // this.#dom = new JSDOM(response.data as string);
    // this.#dom.window.document.evaluate;
  }

  static async createFromResponse(response: Response) {
    const page = new Page({ kind: 'response', response });
    page.#htmlString = await response.text();
    const document = new jsdom.JSDOM(page.#htmlString);
    page.#xdoc = document.window.document;
    return page;
  }

  getElementById<T extends HTMLElement>(id: string) {
    const element = this.#xdoc.getElementById(id);

    if (!element || !(element as T)) return undefined;
    return new GenericElement<T>(element as T);
  }
  getDOMElementsByClassName(className: string) {
    return Array.from(this.#xdoc.getElementsByClassName(className))
      .filter((value) => {
        if (!value || !(value as HTMLElement)) return false;
        return true;
      })
      .map((e) => new DOMElement(e as HTMLElement));
  }
  getElementsByClassName<T extends HTMLElement>(className: string) {
    //const elementArray = new Array<HTMLElement>();
    return Array.from(this.#xdoc.getElementsByClassName(className))
      .filter((value) => {
        if (!value || !(value as T)) return false;
        return true;
      })
      .map((e) => new GenericElement<T>(e as T));
    //return elementArray;
  }

  get html(): string {
    return this.#htmlString;
  }

  searchByXPath(path: string) {
    // return xpath.select(path, this.#xdoc).map((v) => {
    //   return DOMElement.parseXPathResultValidValue(v);
    // });
    return this.#xdoc.querySelectorAll(path);
  }

  searchOneByXPath(path: string) {
    return this.#xdoc.querySelector(path);
    // const searchValue = xpath.select(path, this.#xdoc, true);
    // return DOMElement.parseXPathResultValue(searchValue);
  }

  get title() {
    let fileName;
    if (this.#response) {
      if ('Content-Disposition' in this.#response.headers) {
        let headerValue = this.#response.headers['Content-Disposition'] as
          | string
          | string[];
        if (headerValue) {
          if (
            Array.isArray(headerValue) &&
            headerValue.length > 0 &&
            headerValue[0]
          ) {
            headerValue = headerValue[0];
          }
          fileName = decodeURI(
            (headerValue as string).substring(
              headerValue.indexOf('filename=') + 9,
            ),
          );
        }
      }
    }
    if (!fileName) {
      const titleElements = this.#xdoc.getElementsByTagName('title');

      if (titleElements.length > 0) {
        console.log(titleElements.item(0));
        const titleElement = titleElements.item(0) as HTMLTitleElement;
        fileName = titleElement.textContent ?? '';
      }
    }
    return fileName;
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
