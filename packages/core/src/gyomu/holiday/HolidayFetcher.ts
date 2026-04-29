// core/domain/holiday/HolidayFetcher.ts

import { Effect, ServiceMap } from 'effect';
import { MarketHolidaySchema } from '../../schemas/gyomu.js';
import { GyomuError } from '../../errors.js';

export interface HolidayFetcher {
  fetch: (
    market: string,
  ) => Effect.Effect<(typeof MarketHolidaySchema.types._select)[], GyomuError>;
}

export class HolidayFetcher extends ServiceMap.Service<
  HolidayFetcher,
  HolidayFetcher
>()('HolidayFetcher') {}
