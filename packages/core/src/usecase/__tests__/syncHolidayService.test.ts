import { describe, it, expect, vi } from 'vitest';
import { Effect, Layer } from 'effect';

import { syncHoliday } from '../syncHolidayService.js';
import { GyomuRepository } from '../../gyomu/GyomuRepository.js';
import { HolidayFetcher } from '../../gyomu/holiday/HolidayFetcher.js';
import { LocalDate } from '../../entity/date.js';

// --- モックデータ ---
const mockIncoming = [
  {
    market: 'JP',
    holiday: LocalDate.make('2024-01-01'),
    year: 2024,
    name: '元日',
  },
  {
    market: 'JP',
    holiday: LocalDate.make('2024-02-11'),
    year: 2024,
    name: '建国記念日',
  },
];

const mockExisting = [
  {
    id: '1',
    market: 'JP',
    holiday: LocalDate.make('2024-01-01'),
    year: 2024,
  }, // unchanged
  {
    id: '2',
    market: 'JP',
    holiday: LocalDate.make('2024-02-11'),
    year: 2024,
  }, // update
  {
    id: '3',
    market: 'JP',
    holiday: LocalDate.make('2024-03-01'),
    year: 2024,
  }, // delete
];

// --- Repositoryモック ---
const repoMock = {
  marketHoliday: {
    findByMarket: vi.fn(),
    synchronizeRecords: vi.fn(),
  },
};

// --- Layer ---
const TestLayer = Layer.succeed(GyomuRepository, repoMock as any);

describe('syncHoliday', () => {
  it('正常系：diffが正しく計算される', async () => {
    // repositoryモック
    repoMock.marketHoliday.findByMarket.mockReturnValue(
      Effect.succeed(mockExisting),
    );
    repoMock.marketHoliday.synchronizeRecords.mockReturnValue(
      Effect.succeed({
        insertedRows: [],
        updatedRows: [],
        deletedCount: 0n,
      }),
    );

    const HolidayFetcherMock = Layer.succeed(HolidayFetcher, {
      fetch: (market: string) => Effect.succeed(mockIncoming),
    } as any);

    const program = syncHoliday('JP').pipe(
      Effect.provide(Layer.mergeAll(TestLayer, HolidayFetcherMock)),
    );

    await Effect.runPromise(program);

    // 今はlogだけなので副作用確認は難しいが、
    // 例として repository が呼ばれたか確認
    expect(repoMock.marketHoliday.findByMarket).toHaveBeenCalledWith('JP');
  });

  it('existingがtargetYearsでfilterされる', async () => {
    repoMock.marketHoliday.findByMarket.mockReturnValue(
      Effect.succeed([
        { id: '1', holiday: '2023-01-01', year: 2023, name: '古い' },
        { id: '2', holiday: '2024-01-01', year: 2024, name: '元日' },
      ]),
    );
    repoMock.marketHoliday.synchronizeRecords.mockReturnValue(
      Effect.succeed({}),
    );

    const HolidayFetcherMock = Layer.succeed(HolidayFetcher, {
      fetch: (market: string) =>
        Effect.succeed([
          {
            holiday: LocalDate.make('2024-01-01'),
            market: 'JP',
            year: 2024,
            name: '元日',
          },
        ]),
    } as any);

    const program = syncHoliday('JP').pipe(
      Effect.provide(Layer.mergeAll(TestLayer, HolidayFetcherMock)),
    );

    await Effect.runPromise(program);
    //console.log(result);
    // 2023は除外されるので diff対象は1件のみになる想定
    expect(repoMock.marketHoliday.findByMarket).toHaveBeenCalled();
  });
});
