import { Effect } from 'effect'
import { GyomuRepository } from '../gyomu/GyomuRepository.js'
import { diffEntities } from '../data/crud/diffEntities.js'
import { MarketHolidaySchema } from '../schemas/gyomu/gyomu.js'
import { HolidayFetcher } from '../gyomu/holiday/HolidayFetcher.js'
import { gyomuExternalFailure } from '../error/GyomuError.js'

/**
 * Synchronizes market holiday records by fetching data for the specified market and reconciling it with the existing database state.
 *
 * @param market The market identifier to synchronize holidays for.
 *
 * @returns An Effect that yields the result of the synchronization operation, or fails with a Gyomu external failure.
 */
export const syncHoliday = (market: string) =>
  Effect.gen(function* () {
    const fetcher = yield* HolidayFetcher
    const holidays = yield* fetcher.fetch(market)
    const repo = yield* GyomuRepository
    const targetYears: Array<number> = [...new Set(holidays.map((h) => h.year))]
    const existingHolidays = (yield* repo.marketHoliday
      .findByMarket(market)
      .pipe(Effect.mapError(gyomuExternalFailure(`get holidays on ${market}`, 'holiday')))).filter(
      (r) => targetYears.includes(r.year),
    )

    const result = diffEntities(MarketHolidaySchema)({
      incoming: holidays,
      existing: existingHolidays,
      getKey: (v) => {
        return v.holiday as string
      },
    })

    yield* Effect.logInfo(result)
    const returnValue = yield* repo.marketHoliday.synchronizeRecords({
      diffResult: result,
      deleteRequired: true,
    })
    return returnValue
  }).pipe(Effect.mapError(gyomuExternalFailure(`syncHoliday with ${market}`, 'holiday')))
