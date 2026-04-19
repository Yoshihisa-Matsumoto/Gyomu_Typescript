//import { gyomu_market_holiday } from '@prisma/client';
import { Effect, Layer } from 'effect';
import {
  BusinessCalendarService,
  BusinessCalendar,
} from '../date/BusinessCalendar.js';

import { beforeEach, expect, test } from 'vitest';
import { MainLayer } from '../../infrastructure/layer.js';
import { ConfigLayer } from '../../infrastructure/config.js';
import { NodeFileSystem } from '@effect/platform-node';
import { makeRunner } from '../../infrastructure/runtime.js';
import { GyomuRepositoryMock } from './baseDBClass.js';
import { LocalDate } from '../../schemas/date.js';
//import { prismaMock } from './baseDBClass';

// let mockCtx: MockContext;
// let ctx: Context;
let access: BusinessCalendar;
const TestLayer = Layer.mergeAll(
  BusinessCalendarService.live,
  MainLayer,
  ConfigLayer,
)
  .pipe(Layer.provideMerge(GyomuRepositoryMock))
  // .pipe(Layer.provideMerge(KyselyService.live))
  .pipe(Layer.provideMerge(NodeFileSystem.layer));
const testRunner = makeRunner(TestLayer);

beforeEach(async () => {
  // mockCtx = createMockContext();
  // ctx = mockCtx as unknown as Context;
  // mockCtx.prisma.gyomu_market_holiday.findMany.mockResolvedValue(
  //   dummy_holidays
  // );
  //access = await MarketDateAccess.getMarketAccess('JP' as LocalDate;
  //console.log('beforeEach');
  const program = Effect.gen(function* () {
    const marketService = yield* BusinessCalendarService;
    const access = yield* marketService.get('JP');
    return access;
  });
  const result = await testRunner(program);
  access = result;
});

test('Construction Test', () => {
  expect(access.isBusinessDay('1984-04-27' as LocalDate)).toBeTruthy();
  expect(access.isBusinessDay('1984-04-28' as LocalDate)).toBeFalsy();
  expect(access.isBusinessDay('1984-04-29' as LocalDate)).toBeFalsy();
  expect(access.isBusinessDay('1984-04-30' as LocalDate)).toBeFalsy();
  expect(access.isBusinessDay('1984-05-01' as LocalDate)).toBeTruthy();
  expect(access.isBusinessDay('1984-05-02' as LocalDate)).toBeTruthy();
  expect(access.isBusinessDay('1984-05-03' as LocalDate)).toBeFalsy();
  expect(access.isBusinessDay('1984-05-04' as LocalDate)).toBeTruthy();
  expect(access.isBusinessDay('1984-05-05' as LocalDate)).toBeFalsy();
  expect(access.isBusinessDay('1984-05-06' as LocalDate)).toBeFalsy();
  expect(access.isBusinessDay('1984-05-07' as LocalDate)).toBeTruthy();
});

test('Business Day Test', () => {
  let targetDate = '1984-05-02' as LocalDate;
  let testResult = [
    { offset: 1, result: '1984-05-04' as LocalDate },
    { offset: 2, result: '1984-05-07' as LocalDate },
    { offset: 3, result: '1984-05-08' as LocalDate },
    { offset: 7, result: '1984-05-14' as LocalDate },
    { offset: -1, result: '1984-05-01' as LocalDate },
    { offset: -2, result: '1984-04-27' as LocalDate },
    { offset: -3, result: '1984-04-26' as LocalDate },
    { offset: -7, result: '1984-04-20' as LocalDate },
  ];
  testResult.forEach((v) => {
    expect(access.businessDay(targetDate, v.offset)).toEqual(v.result);
  });
  targetDate = '1984-05-03' as LocalDate;
  testResult = [
    { offset: 1, result: '1984-05-04' as LocalDate },
    { offset: 2, result: '1984-05-07' as LocalDate },
    { offset: 3, result: '1984-05-08' as LocalDate },
    { offset: 7, result: '1984-05-14' as LocalDate },

    { offset: -1, result: '1984-05-02' as LocalDate },
    { offset: -2, result: '1984-05-01' as LocalDate },
    { offset: -3, result: '1984-04-27' as LocalDate },
    { offset: -4, result: '1984-04-26' as LocalDate },
    { offset: -8, result: '1984-04-20' as LocalDate },
  ];
  testResult.forEach((v) => {
    expect(access.businessDay(targetDate, v.offset)).toEqual(v.result);
  });
});

test('BusinessDay of Beginning Month', () => {
  const testCases = [
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 1,
      result: '1984-05-01' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 0,
      result: '1984-05-01' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 2,
      result: '1984-05-02' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 3,
      result: '1984-05-04' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 1,
      result: '1984-01-03' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 0,
      result: '1984-01-03' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 2,
      result: '1984-01-04' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 3,
      result: '1984-01-05' as LocalDate,
    },
  ];

  testCases.forEach((c) => {
    expect(
      access.businessDayOfBeginningMonthWithOffset(c.targetDate, c.offset),
    ).toEqual(c.result);
  });
});

test('BusinessDay of Next Beginning Month', () => {
  const testCases = [
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 1,
      result: '1984-06-01' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 0,
      result: '1984-06-01' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 2,
      result: '1984-06-04' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 3,
      result: '1984-06-05' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 1,
      result: '1984-02-01' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 0,
      result: '1984-02-01' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 2,
      result: '1984-02-02' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 3,
      result: '1984-02-03' as LocalDate,
    },
  ];

  testCases.forEach((c) => {
    expect(
      access.businessDayOfBeginningOfNextMonthWithOffset(
        c.targetDate,
        c.offset,
      ),
    ).toEqual(c.result);
  });
});

test('BusinessDay of Previous Beginning Month', () => {
  const testCases = [
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 1,
      result: '1984-04-02' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 0,
      result: '1984-04-02' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 2,
      result: '1984-04-03' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 1,
      result: '1983-12-01' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 0,
      result: '1983-12-01' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 2,
      result: '1983-12-02' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 3,
      result: '1983-12-05' as LocalDate,
    },
  ];

  testCases.forEach((c) => {
    expect(
      access.businessDayOfBeginningOfPreviousMonthWithOffset(
        c.targetDate,
        c.offset,
      ),
    ).toEqual(c.result);
  });
});

test('BusinessDay of End Of Month', () => {
  const testCases = [
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 1,
      result: '1984-05-31' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 0,
      result: '1984-05-31' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 2,
      result: '1984-05-30' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 1,
      result: '1984-01-31' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 0,
      result: '1984-01-31' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 2,
      result: '1984-01-30' as LocalDate,
    },
    {
      targetDate: '1984-04-05' as LocalDate,
      offset: 1,
      result: '1984-04-27' as LocalDate,
    },
  ];

  testCases.forEach((c) => {
    expect(
      access.businessDayOfEndMonthWithOffset(c.targetDate, c.offset),
    ).toEqual(c.result);
  });
});

test('BusinessDay of End Of Next Month', () => {
  const testCases = [
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 1,
      result: '1984-06-29' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 0,
      result: '1984-06-29' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 2,
      result: '1984-06-28' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 1,
      result: '1984-02-29' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 0,
      result: '1984-02-29' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 2,
      result: '1984-02-28' as LocalDate,
    },
    {
      targetDate: '1984-04-05' as LocalDate,
      offset: 1,
      result: '1984-05-31' as LocalDate,
    },
  ];

  testCases.forEach((c) => {
    expect(
      access.businessDayOfEndOfNextMonthWithOffset(c.targetDate, c.offset),
    ).toEqual(c.result);
  });
});

test('BusinessDay of End Of Previous Month', () => {
  const testCases = [
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 1,
      result: '1984-04-27' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 0,
      result: '1984-04-27' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 2,
      result: '1984-04-26' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 1,
      result: '1983-12-30' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 0,
      result: '1983-12-30' as LocalDate,
    },
    {
      targetDate: '1984-01-01' as LocalDate,
      offset: 2,
      result: '1983-12-29' as LocalDate,
    },
    {
      targetDate: '1984-04-05' as LocalDate,
      offset: 1,
      result: '1984-03-30' as LocalDate,
    },
  ];

  testCases.forEach((c) => {
    expect(
      access.businessDayOfEndOfPreviousMonthWithOffset(c.targetDate, c.offset),
    ).toEqual(c.result);
  });
});

test('BusinessDay of Beginning of Year', () => {
  const testCases = [
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 1,
      result: '1984-01-03' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 0,
      result: '1984-01-03' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 2,
      result: '1984-01-04' as LocalDate,
    },
    {
      targetDate: '1985-02-01' as LocalDate,
      offset: 1,
      result: '1985-01-01' as LocalDate,
    },
  ];

  testCases.forEach((c) => {
    expect(access.businessDayOfBeginningOfYear(c.targetDate, c.offset)).toEqual(
      c.result,
    );
  });
});

test('BusinessDay of End of Year', () => {
  const testCases = [
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 1,
      result: '1984-12-31' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 0,
      result: '1984-12-31' as LocalDate,
    },
    {
      targetDate: '1984-05-01' as LocalDate,
      offset: 2,
      result: '1984-12-28' as LocalDate,
    },
  ];

  testCases.forEach((c) => {
    expect(access.businessDayOfEndOfYear(c.targetDate, c.offset)).toEqual(
      c.result,
    );
  });
});
