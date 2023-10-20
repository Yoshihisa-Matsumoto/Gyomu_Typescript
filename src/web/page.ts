import { AxiosResponse } from 'axios';
import xmlser from 'xmlserializer';
import xdom from '@xmldom/xmldom';
import { DOMElement, GenericElement } from './element';
import { parse } from 'parse5';
import xpath from 'xpath';

export type PageResponseOption = {
  kind: 'response';
  response: AxiosResponse;
};
export type PageTextOption = {
  kind: 'html';
  htmlText: string;
};

export type PageOption = PageResponseOption | PageTextOption;

export class Page {
  readonly #response: AxiosResponse | undefined;
  //readonly #dom: JSDOM;
  readonly #xdoc: Document;
  readonly #htmlString: string;
  constructor(option: PageOption) {
    if (option.kind === 'response') {
      this.#response = option.response;
      this.#htmlString = this.#response.data as string;
    } else {
      this.#htmlString = option.htmlText;
    }
    const document = parse(this.#htmlString);
    const xhtml = xmlser.serializeToString(document);
    this.#xdoc = new xdom.DOMParser().parseFromString(xhtml);
    // this.#dom = new JSDOM(response.data as string);
    // this.#dom.window.document.evaluate;
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
    const searchValue = xpath.select(path, this.#xdoc, false);
    if (!Array.isArray(searchValue)) return searchValue;

    return searchValue.map((v) => {
      return DOMElement.parseXPathResultValidValue(v);
    });
  }

  searchOneByXPath(path: string) {
    const searchValue = xpath.select(path, this.#xdoc, true);
    return DOMElement.parseXPathResultValue(searchValue);
  }

  get title() {
    let fileName;
    if (!!this.#response) {
      if ('Content-Disposition' in this.#response.headers) {
        const headerValue = this.#response.headers['Content-Disposition'];
        fileName = decodeURI(
          headerValue.substring(headerValue.indexOf('filename=') + 9)
        );
      }
    }
    if (!fileName) {
      const titleElements = this.#xdoc.getElementsByTagName('title');
      if (titleElements.length > 0) {
        const titleElement = titleElements.item(0) as HTMLTitleElement;
        fileName = titleElement.innerText;
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
