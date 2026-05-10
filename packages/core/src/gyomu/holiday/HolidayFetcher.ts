// core/domain/holiday/HolidayFetcher.ts

import { Context } from 'effect'
import type { Effect } from 'effect'
import type { GyomuError } from '../../error/GyomuError.js'
import type { MarketHolidaySchema } from '../../schemas/gyomu.js'

export interface HolidayFetcherService {
  fetch: (
    market: string,
  ) => Effect.Effect<Array<typeof MarketHolidaySchema.types._insert>, GyomuError>
}

export class HolidayFetcher extends Context.Service<HolidayFetcher, HolidayFetcherService>()(
  'HolidayFetcher',
) {}
