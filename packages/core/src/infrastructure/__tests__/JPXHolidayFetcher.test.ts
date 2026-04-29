// tests/infra/holiday/JPXHolidayFetcher.test.ts

import { describe, it, expect, vi } from 'vitest';
import { Effect } from 'effect';
import { JPXHolidayFetcherLayer } from '../holiday/JpxHolidayFetcher.js';
import { HolidayFetcher } from '../../gyomu/holiday/HolidayFetcher.js';

// ★ モック
vi.mock('../holiday/jpxFetcher.js', () => ({
  fetchJpxHolidays: vi.fn(),
}));

import { fetchJpxHolidays } from '../holiday/jpxFetcher.js';

describe('JPXHolidayFetcher', () => {
  it('should fetch holidays when market is JP', async () => {
    // arrange
    const mockData = [{ year: 2024, holiday: '2024-01-01' }];
    (fetchJpxHolidays as any).mockReturnValue(Effect.succeed(mockData));

    // act
    const program = Effect.gen(function* () {
      const fetcher = yield* HolidayFetcher;
      return yield* fetcher.fetch('JP');
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(JPXHolidayFetcherLayer)),
    );

    // assert
    expect(result).toEqual(mockData);
    expect(fetchJpxHolidays).toHaveBeenCalled();
  });

  it('should fail when market is not JP', async () => {
    // act
    const program = Effect.gen(function* () {
      const fetcher = yield* HolidayFetcher;
      return yield* fetcher.fetch('US');
    });

    // assert
    await expect(
      Effect.runPromise(program.pipe(Effect.provide(JPXHolidayFetcherLayer))),
    ).rejects.toMatchObject({ _tag: 'GyomuError', message: 'Invalid market' });
  });

  it('should map error when fetch fails', async () => {
    // arrange
    (fetchJpxHolidays as any).mockReturnValue(
      Effect.fail(new Error('network error')),
    );

    const program = Effect.gen(function* () {
      const fetcher = yield* HolidayFetcher;
      return yield* fetcher.fetch('JP');
    });

    // assert
    await expect(
      Effect.runPromise(program.pipe(Effect.provide(JPXHolidayFetcherLayer))),
    ).rejects.toMatchObject({
      _tag: 'GyomuError',
      message: 'fetchHoliday failed',
    });
  });
});
