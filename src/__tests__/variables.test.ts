import * as tet from './holidays.test';
import { prismaMock } from './baseDBClass';
import { VariableTranslator } from '../variable';
import { createDateFromYYYYMMDD, createDateOnly } from '../dateOperation';
import { format, isEqual } from 'date-fns';

beforeEach(async () => {});

const testCases = [
  { parameter: '{%JP$TODAY$yyyyMMdd%}', expected: '19840502' },
  { parameter: '{%JP$2$NEXTBUS$yyyyMMdd%}', expected: '19840507' },
  { parameter: '{%JP$2$PREVBUS$yyyyMMdd%}', expected: '19840427' },
  { parameter: '{%JP$2$BBOM$yyyyMMdd%}', expected: '19840502' },
  { parameter: '{%JP$2$BBOY$yyyyMMdd%}', expected: '19840104' },
  { parameter: '{%JP$2$BOM$yyyyMMdd%}', expected: '19840502' },
  { parameter: '{%JP$2$BOY$yyyyMMdd%}', expected: '19840102' },
  { parameter: '{%JP$2$BEOM$yyyyMMdd%}', expected: '19840530' },
  { parameter: '{%JP$2$BEOY$yyyyMMdd%}', expected: '19841228' },
  { parameter: '{%JP$2$EOM$yyyyMMdd%}', expected: '19840530' },
  { parameter: '{%JP$2$EOY$yyyyMMdd%}', expected: '19841230' },
  { parameter: '{%JP$2$NEXTBBOM$yyyyMMdd%}', expected: '19840604' },
  { parameter: '{%JP$2$NEXTBUS$yyyyMMdd%}', expected: '19840507' },
  { parameter: '{%JP$2$NEXTDAY$yyyyMMdd%}', expected: '19840504' },
  { parameter: '{%JP$2$NEXTBEOM$yyyyMMdd%}', expected: '19840628' },
  { parameter: '{%JP$2$PREVBUS$yyyyMMdd%}', expected: '19840427' },
  { parameter: '{%JP$2$PREVDAY$yyyyMMdd%}', expected: '19840430' },
  { parameter: '{%JP$2$PREVBEOM$yyyyMMdd%}', expected: '19840426' },
];

test('variables parse', async () => {
  const translator = await VariableTranslator.getTranslator('JP');
  const targetDate = createDateOnly(1984, 5, 2);

  testCases.forEach(async (c) => {
    let result = await translator.parse(c.parameter, targetDate);
    let isSuccess = result.isSuccess();
    if (!result.isSuccess()) {
      console.log(c.parameter);
      console.log(result.error);
      expect(isSuccess).toBeTruthy();
    } else {
      if (result.value !== c.expected) console.log(c.parameter);
      expect(result.value).toEqual(c.expected);
    }
  });
});

test('variables parseDate', async () => {
  const translator = await VariableTranslator.getTranslator('JP');
  const targetDate = createDateOnly(1984, 5, 2);

  testCases.forEach(async (c) => {
    let result = await translator.parseDate(c.parameter, targetDate);
    let isSuccess = result.isSuccess();
    if (!result.isSuccess()) {
      console.log(c.parameter);
      console.log(result.error);
      expect(isSuccess).toBeTruthy();
    } else {
      let expectedDate = createDateFromYYYYMMDD(c.expected);
      if (!isEqual(result.value, expectedDate)) console.log(c.parameter);
      expect(result.value).toEqual(expectedDate);
    }
  });
});
