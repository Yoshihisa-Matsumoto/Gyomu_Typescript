// core/domain/holiday/HolidayFetcher.ts

import { Effect, Context } from 'effect';
import { GyomuError } from '../../error/GyomuError.js';
import { MarketHolidaySchema } from '../../schemas/gyomu.js';

export interface HolidayFetcherService {
  fetch: (
    market: string,
  ) => Effect.Effect<(typeof MarketHolidaySchema.types._insert)[], GyomuError>;
}

export class HolidayFetcher extends Context.Service<
  HolidayFetcher,
  HolidayFetcherService
>()('HolidayFetcher') {}
