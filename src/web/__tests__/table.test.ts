import { readFileSync } from 'fs';
import path from 'path';
import { Page } from '../page';
import { convertGenericElementByTagName } from '../util';

test('Table initialization', () => {
  const page = new Page({
    kind: 'html',
    htmlText: readFileSync(path.join('tests', 'test.html')).toString(),
  });
  const tablesDiv = page.getElementsByClassName<HTMLDivElement>(
    'component-normal-table'
  );
  const table = convertGenericElementByTagName(
    'table',
    tablesDiv[0].getGenericElementsByTagName('table')[0],
    { headerExist: false }
  );

  const dictionaryArray = table.toDictionaryArray();
  //console.log(dictionaryArray);
  expect(dictionaryArray).toEqual([
    { Column1: '1', Column2: 'A' },
    { Column1: '2', Column2: 'B' },
    { Column1: '3', Column2: 'C' },
  ]);
});
