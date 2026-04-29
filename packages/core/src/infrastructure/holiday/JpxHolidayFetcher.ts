import { Effect, Layer } from 'effect';
import { HolidayFetcher } from '../../gyomu/holiday/HolidayFetcher.js';
import { fetchJpxHolidays } from './jpxFetcher.js';
import { wrapInfraError } from '@gyomu/shared';
import { GyomuError, gyomuExternalFailure } from '../../errors.js';

const JPXHolidayFetcherLive = {
  fetch: (market: string) => {
    if (market != 'JP')
      return Effect.fail(
        new GyomuError({
          message: 'Invalid market',
          operation: 'fetchHoliday',
          domain: 'market',
          reason: 'invalid_input',
          cause: undefined,
        }),
      );
    return fetchJpxHolidays().pipe(
      Effect.mapError(gyomuExternalFailure('fetchHoliday', 'market')),
    );
  },
};

export const JPXHolidayFetcherLayer = Layer.effect(
  HolidayFetcher,
  Effect.succeed(JPXHolidayFetcherLive),
);
