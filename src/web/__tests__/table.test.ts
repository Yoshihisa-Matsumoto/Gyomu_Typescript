import { platform } from '../../infrastructure/fs/index.js';
import { Page } from '../page.js';
import { convertGenericElementByTagName } from '../util.js';
import { expect, test } from 'vitest';

test('Table initialization', () => {
  const page = new Page({
    kind: 'html',
    htmlText: platform
      .readFileSync(platform.join('tests', 'test.html'))
      .toString(),
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
