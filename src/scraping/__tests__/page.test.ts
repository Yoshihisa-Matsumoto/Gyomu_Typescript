import { describe, it, expect } from 'vitest';
import { Page } from '../dom/page.js';

// ===== helper =====
const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Test Title</title>
  </head>
  <body>
    <div id="main" class="container">Hello</div>
    <div class="item">A</div>
    <div class="item">B</div>
  </body>
</html>
`;

describe('Page (html input)', () => {
  it('htmlをそのまま保持する', () => {
    const page = new Page({ kind: 'html', htmlText: html });
    expect(page.html).toContain('Test Title');
  });

  it('getElementByIdが取得できる', () => {
    const page = new Page({ kind: 'html', htmlText: html });

    const el = page.getElementById<HTMLDivElement>('main');

    expect(el).toBeDefined();
  });

  it('getElementById: 存在しない場合undefined', () => {
    const page = new Page({ kind: 'html', htmlText: html });

    const el = page.getElementById('not-exist');

    expect(el).toBeUndefined();
  });

  it('getElementsByClassNameが配列で取得できる', () => {
    const page = new Page({ kind: 'html', htmlText: html });

    const list = page.getElementsByClassName<HTMLDivElement>('item');

    expect(list.length).toBe(2);
  });

  it('getDOMElementsByClassNameが取得できる', () => {
    const page = new Page({ kind: 'html', htmlText: html });

    const list = page.getDOMElementsByClassName('item');

    expect(list.length).toBe(2);
  });

  it('searchByXPath(querySelectorAll)が動く', () => {
    const page = new Page({ kind: 'html', htmlText: html });

    const nodes = page.searchByXPath('.item');

    expect(nodes.length).toBe(2);
  });

  it('searchOneByXPath(querySelector)が動く', () => {
    const page = new Page({ kind: 'html', htmlText: html });

    const node = page.searchOneByXPath('#main');

    expect(node).not.toBeNull();
  });

  it('titleが<title>から取得される', () => {
    const page = new Page({ kind: 'html', htmlText: html });

    expect(page.title).toBe('Test Title');
  });
});

describe('Page (response)', () => {
  it('createFromResponseでhtmlが読み込まれる', async () => {
    const mockResponse = {
      text: async () => html,
      headers: {},
    } as any;

    const page = await Page.createFromResponse(mockResponse);

    expect(page.html).toContain('Test Title');
  });

  it('Content-Dispositionからtitleを取得', async () => {
    const mockResponse = {
      text: async () => html,
      headers: {
        'Content-Disposition': 'attachment; filename=test.html',
      },
    } as any;

    const page = await Page.createFromResponse(mockResponse);

    expect(page.title).toBe('test.html');
  });

  it('Content-Dispositionが配列でも取得できる', async () => {
    const mockResponse = {
      text: async () => html,
      headers: {
        'Content-Disposition': ['attachment; filename=test2.html'],
      },
    } as any;

    const page = await Page.createFromResponse(mockResponse);

    expect(page.title).toBe('test2.html');
  });
});
