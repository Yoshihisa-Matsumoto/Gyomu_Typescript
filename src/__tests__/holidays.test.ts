//import { gyomu_market_holiday } from '@prisma/client';
import MarketDateAccess from '../holidays';

import { Context } from '../dbsingleton';
import { beforeEach, expect, test } from 'vitest';
//import { prismaMock } from './baseDBClass';

// let mockCtx: MockContext;
// let ctx: Context;
let access: MarketDateAccess;

beforeEach(async () => {
  // mockCtx = createMockContext();
  // ctx = mockCtx as unknown as Context;
  // mockCtx.prisma.gyomu_market_holiday.findMany.mockResolvedValue(
  //   dummy_holidays
  // );
  //access = await MarketDateAccess.getMarketAccess('JP');
  //console.log('beforeEach');
  const result = await MarketDateAccess.getMarketAccess('JP');
  if (result.isErr()) expect(result.isOk()).toBeTruthy();
  else access = result.value;
});

test('Construction Test', () => {
  expect(access.isBusinessDay(new Date('1984-04-27'))).toBeTruthy();
  expect(access.isBusinessDay(new Date('1984-04-28'))).toBeFalsy();
  expect(access.isBusinessDay(new Date('1984-04-29'))).toBeFalsy();
  expect(access.isBusinessDay(new Date('1984-04-30'))).toBeFalsy();
  expect(access.isBusinessDay(new Date('1984-05-01'))).toBeTruthy();
  expect(access.isBusinessDay(new Date('1984-05-02'))).toBeTruthy();
  expect(access.isBusinessDay(new Date('1984-05-03'))).toBeFalsy();
  expect(access.isBusinessDay(new Date('1984-05-04'))).toBeTruthy();
  expect(access.isBusinessDay(new Date('1984-05-05'))).toBeFalsy();
  expect(access.isBusinessDay(new Date('1984-05-06'))).toBeFalsy();
  expect(access.isBusinessDay(new Date('1984-05-07'))).toBeTruthy();
});

test('Business Day Test', () => {
  let targetDate = new Date('1984-05-02');
  let testResult = [
    { offset: 1, result: new Date('1984-05-04') },
    { offset: 2, result: new Date('1984-05-07') },
    { offset: 3, result: new Date('1984-05-08') },
    { offset: 7, result: new Date('1984-05-14') },
    { offset: -1, result: new Date('1984-05-01') },
    { offset: -2, result: new Date('1984-04-27') },
    { offset: -3, result: new Date('1984-04-26') },
    { offset: -7, result: new Date('1984-04-20') },
  ];
  testResult.forEach((v) => {
    expect(access.businessDay(targetDate, v.offset)).toEqual(v.result);
  });
  targetDate = new Date('1984-05-03');
  testResult = [
    { offset: 1, result: new Date('1984-05-04') },
    { offset: 2, result: new Date('1984-05-07') },
    { offset: 3, result: new Date('1984-05-08') },
    { offset: 7, result: new Date('1984-05-14') },

    { offset: -1, result: new Date('1984-05-02') },
    { offset: -2, result: new Date('1984-05-01') },
    { offset: -3, result: new Date('1984-04-27') },
    { offset: -4, result: new Date('1984-04-26') },
    { offset: -8, result: new Date('1984-04-20') },
  ];
  testResult.forEach((v) => {
    expect(access.businessDay(targetDate, v.offset)).toEqual(v.result);
  });
});

test('BusinessDay of Beginning Month', () => {
  let testCases = [
    {
      targetDate: new Date('1984-05-01'),
      offset: 1,
      result: new Date('1984-05-01'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 0,
      result: new Date('1984-05-01'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 2,
      result: new Date('1984-05-02'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 3,
      result: new Date('1984-05-04'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 1,
      result: new Date('1984-01-03'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 0,
      result: new Date('1984-01-03'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 2,
      result: new Date('1984-01-04'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 3,
      result: new Date('1984-01-05'),
    },
  ];

  testCases.forEach((c) => {
    expect(
      access.businessDayOfBeginningMonthWithOffset(c.targetDate, c.offset)
    ).toEqual(c.result);
  });
});

test('BusinessDay of Next Beginning Month', () => {
  let testCases = [
    {
      targetDate: new Date('1984-05-01'),
      offset: 1,
      result: new Date('1984-06-01'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 0,
      result: new Date('1984-06-01'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 2,
      result: new Date('1984-06-04'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 3,
      result: new Date('1984-06-05'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 1,
      result: new Date('1984-02-01'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 0,
      result: new Date('1984-02-01'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 2,
      result: new Date('1984-02-02'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 3,
      result: new Date('1984-02-03'),
    },
  ];

  testCases.forEach((c) => {
    expect(
      access.businessDayOfBeginningOfNextMonthWithOffset(c.targetDate, c.offset)
    ).toEqual(c.result);
  });
});

test('BusinessDay of Previous Beginning Month', () => {
  let testCases = [
    {
      targetDate: new Date('1984-05-01'),
      offset: 1,
      result: new Date('1984-04-02'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 0,
      result: new Date('1984-04-02'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 2,
      result: new Date('1984-04-03'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 1,
      result: new Date('1983-12-01'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 0,
      result: new Date('1983-12-01'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 2,
      result: new Date('1983-12-02'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 3,
      result: new Date('1983-12-05'),
    },
  ];

  testCases.forEach((c) => {
    expect(
      access.businessDayOfBeginningOfPreviousMonthWithOffset(
        c.targetDate,
        c.offset
      )
    ).toEqual(c.result);
  });
});

test('BusinessDay of End Of Month', () => {
  let testCases = [
    {
      targetDate: new Date('1984-05-01'),
      offset: 1,
      result: new Date('1984-05-31'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 0,
      result: new Date('1984-05-31'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 2,
      result: new Date('1984-05-30'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 1,
      result: new Date('1984-01-31'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 0,
      result: new Date('1984-01-31'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 2,
      result: new Date('1984-01-30'),
    },
    {
      targetDate: new Date('1984-04-05'),
      offset: 1,
      result: new Date('1984-04-27'),
    },
  ];

  testCases.forEach((c) => {
    expect(
      access.businessDayOfEndMonthWithOffset(c.targetDate, c.offset)
    ).toEqual(c.result);
  });
});

test('BusinessDay of End Of Next Month', () => {
  let testCases = [
    {
      targetDate: new Date('1984-05-01'),
      offset: 1,
      result: new Date('1984-06-29'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 0,
      result: new Date('1984-06-29'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 2,
      result: new Date('1984-06-28'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 1,
      result: new Date('1984-02-29'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 0,
      result: new Date('1984-02-29'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 2,
      result: new Date('1984-02-28'),
    },
    {
      targetDate: new Date('1984-04-05'),
      offset: 1,
      result: new Date('1984-05-31'),
    },
  ];

  testCases.forEach((c) => {
    expect(
      access.businessDayOfEndOfNextMonthWithOffset(c.targetDate, c.offset)
    ).toEqual(c.result);
  });
});

test('BusinessDay of End Of Previous Month', () => {
  let testCases = [
    {
      targetDate: new Date('1984-05-01'),
      offset: 1,
      result: new Date('1984-04-27'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 0,
      result: new Date('1984-04-27'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 2,
      result: new Date('1984-04-26'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 1,
      result: new Date('1983-12-30'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 0,
      result: new Date('1983-12-30'),
    },
    {
      targetDate: new Date('1984-01-01'),
      offset: 2,
      result: new Date('1983-12-29'),
    },
    {
      targetDate: new Date('1984-04-05'),
      offset: 1,
      result: new Date('1984-03-30'),
    },
  ];

  testCases.forEach((c) => {
    expect(
      access.businessDayOfEndOfPreviousMonthWithOffset(c.targetDate, c.offset)
    ).toEqual(c.result);
  });
});

test('BusinessDay of Beginning of Year', () => {
  let testCases = [
    {
      targetDate: new Date('1984-05-01'),
      offset: 1,
      result: new Date('1984-01-03'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 0,
      result: new Date('1984-01-03'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 2,
      result: new Date('1984-01-04'),
    },
    {
      targetDate: new Date('1985-02-01'),
      offset: 1,
      result: new Date('1985-01-01'),
    },
  ];

  testCases.forEach((c) => {
    expect(access.businessDayOfBeginningOfYear(c.targetDate, c.offset)).toEqual(
      c.result
    );
  });
});

test('BusinessDay of End of Year', () => {
  let testCases = [
    {
      targetDate: new Date('1984-05-01'),
      offset: 1,
      result: new Date('1984-12-31'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 0,
      result: new Date('1984-12-31'),
    },
    {
      targetDate: new Date('1984-05-01'),
      offset: 2,
      result: new Date('1984-12-28'),
    },
  ];

  testCases.forEach((c) => {
    expect(access.businessDayOfEndOfYear(c.targetDate, c.offset)).toEqual(
      c.result
    );
  });
});
