// core/domain/holiday/HolidayFetcher.ts

import { Context } from 'effect'
import type { Effect } from 'effect'
import type { GyomuError } from '../../error/GyomuError.js'
import type { MarketHolidaySchema } from '../../schemas/gyomu.js'

/**
 * Defines a service for retrieving market-specific holiday schedules.
 */
export interface HolidayFetcherService {
  /**
   * Fetches a list of holidays for the specified market.
   *
   * @param market The identifier of the market to fetch holidays for.
   *
   * @returns An Effect that resolves to an array of market holiday objects or rejects with a GyomuError.
   */
  fetch: (
    market: string,
  ) => Effect.Effect<Array<typeof MarketHolidaySchema.types._insert>, GyomuError>
}

/**
 * A Context Service wrapper for HolidayFetcherService.
 */
export class HolidayFetcher extends Context.Service<HolidayFetcher, HolidayFetcherService>()(
  'HolidayFetcher',
) {}
