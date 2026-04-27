import { platform } from '../../infrastructure/fs/index.js';
import { Page } from '../dom/page.js';
import { convertGenericElementByTagName } from '../convert.js';
import { describe, expect, it, test } from 'vitest';
import { TableRow } from '../table/tableRow.js';
import { JSDOM } from 'jsdom';
import { Effect, Layer } from 'effect';
import { MainLayer, PlatformLayer } from '../../infrastructure/layer.js';
import { makeRunner } from '../../infrastructure/runtime.js';
import { readStringFromFile } from '../../infrastructure/fs/fs-utils.js';

test('Table initialization', async () => {
  const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer);
  const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer);

  const htmlText = await runNodeWithEnvOrThrow(
    Effect.gen(function* () {
      return yield* readStringFromFile(platform.join('tests', 'test.html'));
    }),
  );
  const page = new Page({
    kind: 'html',
    htmlText: htmlText,
  });
  const tablesDiv = page.getElementsByClassName<HTMLDivElement>(
    'component-normal-table',
  );
  const table = convertGenericElementByTagName(
    'table',
    tablesDiv[0].getGenericElementsByTagName('table')[0],
    { headerExist: false },
  );

  const dictionaryArray = table.toDictionaryArray();
  //console.log(dictionaryArray);
  expect(dictionaryArray).toEqual([
    { Column1: '1', Column2: 'A' },
    { Column1: '2', Column2: 'B' },
    { Column1: '3', Column2: 'C' },
  ]);
});

const createRow = (html: string) => {
  const dom = new JSDOM(`<table>${html}</table>`);
  return dom.window.document.querySelector('tr')!;
};

describe('TableRow', () => {
  it('単純な行をパースできる', () => {
    const tr = createRow(`
      <tr>
        <td>A</td>
        <td>B</td>
      </tr>
    `);

    const row = new TableRow(tr);

    expect(row.columns.length).toBe(2);
  });

  it('colspanを展開できる', () => {
    const tr = createRow(`
      <tr>
        <td colspan="2">A</td>
      </tr>
    `);

    const row = new TableRow(tr);

    expect(row.columns.length).toBe(2);
  });

  it('rowspanが次の行に引き継がれる', () => {
    const dom = new JSDOM(`
      <table>
        <tr>
          <td rowspan="2">A</td>
          <td>B</td>
        </tr>
        <tr>
          <td>C</td>
        </tr>
      </table>
    `);

    const rows = dom.window.document.querySelectorAll('tr');

    const row1 = new TableRow(rows[0]);
    const row2 = new TableRow(rows[1], row1);

    expect(row2.columns.length).toBe(2);
  });
});
