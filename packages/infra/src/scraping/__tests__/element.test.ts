import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { DOMElement } from '../dom/element.js';

describe('DOMElement', () => {
  const setup = (html: string) => {
    const dom = new JSDOM(html);
    const el = dom.window.document.body.firstElementChild as HTMLElement;
    return new DOMElement(el);
  };

  it('idが取得できる', () => {
    const el = setup(`<div id="test"></div>`);
    expect(el.id).toBe('test');
  });

  it('innerHtmlが取得できる', () => {
    const el = setup(`<div><span>A</span></div>`);
    expect(el.innerHtml).toBe('<span>A</span>');
  });

  it('innerTextが取得できる', () => {
    const el = setup(`<div>Hello</div>`);
    expect(el.innerText).toBe('Hello');
  });

  it('childNodeValueが取得できる', () => {
    const el = setup(`<div>Text<span>Child</span></div>`);
    expect(el.childNodeValue).toBe('Text');
  });

  it('childElementsはHTMLElementのみ取得する', () => {
    const el = setup(`
      <div>
        text
        <span>A</span>
        <span>B</span>
      </div>
    `);

    const children = el.childElements;

    expect(children.length).toBe(2);
  });

  it('classListが配列で取得できる', () => {
    const el = setup(`<div class="a b c"></div>`);
    expect(el.classList).toEqual(['a', 'b', 'c']);
  });

  it('attributesが取得できる', () => {
    const el = setup(`<div data-id="123" title="test"></div>`);

    const attrs = el.attributes;

    expect(attrs.length).toBe(2);
  });

  it('getAttributeが取得できる', () => {
    const el = setup(`<div data-id="123"></div>`);

    const attr = el.getAttribute('data-id');

    expect(attr).toBeDefined();
  });

  it('getAttribute: 存在しない場合undefined', () => {
    const el = setup(`<div></div>`);

    const attr = el.getAttribute('not-exist');

    expect(attr).toBeUndefined();
  });

  it('searchByXPath(querySelectorAll)が動く', () => {
    const el = setup(`
      <div>
        <span class="item"></span>
        <span class="item"></span>
      </div>
    `);

    const result = el.searchByXPath('.item');

    expect(result.length).toBe(2);
  });

  it('searchOneByXPath(querySelector)が動く', () => {
    const el = setup(`
      <div>
        <span id="target"></span>
      </div>
    `);

    const result = el.searchOneByXPath('#target');

    expect(result).not.toBeNull();
  });
});
