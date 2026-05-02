// import { beforeEach, vi } from 'vitest';

import { Effect, Layer } from 'effect';
import { GyomuRepository } from '@gyomu/core/gyomu';
import { MarketHolidaySchema } from '@gyomu/core/schemas/gyomu';
import { LocalDate } from '@gyomu/shared/entity';
// beforeEach(() => {
//   //console.log('beforeEach in baseDBClass', prismaMock, prisma);
//   mockReset(prismaMock);

//   prismaMock.gyomu_market_holiday.findMany.mockResolvedValue(dummy_holidays);
// });
const testId = 'F6AE5F2D-BD14-4C5F-9CC3-3A69EF90DD5B';

export const GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
  marketHoliday: {
    findByMarket: (market: string) =>
      Effect.succeed(dummy_holidays.filter((h) => h.market === market)),
    findDistinctMarkets: () => Effect.succeed(['JP', 'US']),
  },
} as any);
const dummy_holidays: (typeof MarketHolidaySchema.types._select)[] = [
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-01-01'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-01-02'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-01-15'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-01-16'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-02-11'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-03-20'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-04-29'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-04-30'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-05-03'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-05-05'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-09-15'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-09-23'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-09-24'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-10-10'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-11-03'),
  },
  {
    id: testId,
    year: 1984,
    market: 'JP',
    holiday: LocalDate.make('1984-11-23'),
  },
];
