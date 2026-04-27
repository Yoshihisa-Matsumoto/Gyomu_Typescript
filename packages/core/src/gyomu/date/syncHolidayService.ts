import { Effect } from 'effect';
import { fetchJpxHolidays } from '../../infrastructure/holiday/jpxFetcher.js';
import { GyomuError } from '../../errors.js';
import { GyomuRepository } from '../GyomuRepository.js';
import { diffEntities } from '../../schemas/diffEntities.js';
import { MarketHolidaySchema } from '../../schemas/gyomu.js';
import { unknownError } from '@gyomu/shared';

export const syncHoliday = (
  market: string,
  deps?: {
    retrieveMarketHoliday?: typeof retrieveMarketHoliday;
  },
) =>
  Effect.gen(function* () {
    const retrieve = deps?.retrieveMarketHoliday ?? retrieveMarketHoliday;
    const holidays = yield* retrieve(market);
    const repo = yield* GyomuRepository;
    const targetYears: number[] = [...new Set(holidays.map((h) => h.year))];
    const existingHolidays = (yield* repo.marketHoliday
      .findByMarket(market)
      .pipe(
        Effect.mapError((e) =>
          unknownError(
            GyomuError,
            e,
            `Fail to retrieve existing Market Holiday on ${market}`,
          ),
        ),
      )).filter((r) => targetYears.includes(r.year));

    const result = diffEntities(MarketHolidaySchema)({
      incoming: holidays,
      existing: existingHolidays,
      getKey: (v) => {
        return v.holiday as string;
      },
    });

    yield* Effect.logInfo(result);
    const returnValue = yield* repo.marketHoliday.synchronizeRecords({
      diffResult: result,
      deleteRequired: true,
    });
    return returnValue;
  });

const retrieveMarketHoliday = (market: string) => {
  if (market != 'JP')
    return Effect.fail(unknownError(GyomuError, 'Invalid Market'));
  return fetchJpxHolidays().pipe(
    Effect.mapError((e) =>
      unknownError(
        GyomuError,
        e,
        `Fail to retrieve Market Holiday on ${market}`,
      ),
    ),
  );
};
