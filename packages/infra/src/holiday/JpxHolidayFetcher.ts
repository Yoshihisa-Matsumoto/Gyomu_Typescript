import { Effect, Layer } from 'effect'
import { HolidayFetcher } from '@gyomu/schema/gyomu/holiday'
import { GyomuError, gyomuExternalFailure } from '@gyomu/schema'
import { fetchJpxHolidays } from './jpxFetcher.js'

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
      )
    return fetchJpxHolidays().pipe(Effect.mapError(gyomuExternalFailure('fetchHoliday', 'market')))
  },
}

/**
 * Defines a ZIO Layer that provides the JPX holiday fetching implementation for the HolidayFetcher service.
 */
export const JPXHolidayFetcherLayer = Layer.succeed(HolidayFetcher, JPXHolidayFetcherLive)
