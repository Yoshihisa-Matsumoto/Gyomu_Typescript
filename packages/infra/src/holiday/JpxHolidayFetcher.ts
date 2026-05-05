import { Effect, Layer } from 'effect';
import {
  HolidayFetcher,
  HolidayFetcherService,
} from '@gyomu/core/gyomu/holiday';
import { fetchJpxHolidays } from './jpxFetcher.js';
import { wrapInfraError } from '@gyomu/shared';
import { GyomuError, gyomuExternalFailure } from '@gyomu/core';

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

export const JPXHolidayFetcherLayer = Layer.succeed(
  HolidayFetcher,
  JPXHolidayFetcherLive,
);
