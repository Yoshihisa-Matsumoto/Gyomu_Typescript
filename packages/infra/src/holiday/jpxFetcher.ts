import { Effect } from 'effect'
import { NetworkError, isRetryableNetworkError } from '@gyomu/schema'
import { enUS } from 'date-fns/locale'
import { format, isValid, parse } from 'date-fns'
import { fromPromise } from '@gyomu/schema/effect'
import { Page, convertGenericElementByTagName } from '../scraping/index.js'
import { fetchEffect } from '../web/client.js'
import type { MarketHolidaySchema } from '@gyomu/schema/schemas/gyomu'

/**
 * Fetches and parses market holidays from the JPX corporate calendar page, returning a list of holiday records.
 *
 * @returns An Effect that resolves to an array of holiday records. May fail with a NetworkError.
 */
export const fetchJpxHolidays = (): Effect.Effect<
  Array<typeof MarketHolidaySchema.types._insert>,
  NetworkError
> =>
  Effect.gen(function* () {
    const url = 'https://www.jpx.co.jp/english/corporate/about-jpx/calendar/index.html'
    const response = yield* fetchEffect(url)
    const page = yield* fromPromise(NetworkError, (e) => ({
      message: 'Fail to parse page',
      operation: 'request' as const,
      retryable: isRetryableNetworkError(e),
      endpoint: url,
    }))(() => Page.createFromResponse(response))
    // yield* Effect.logInfo(page);
    // console.log(JSON.stringify(page));
    const titles = page.getElementsByClassName('heading-title')
    const tablesDiv = page.getElementsByClassName('component-normal-table')
    console.log('test')
    yield* Effect.logInfo(tablesDiv)
    const results: Array<typeof MarketHolidaySchema.types._insert> = []
    for (let index = 0; index < tablesDiv.length; index++) {
      const titleHeading = titles[index]
      const tableDiv = tablesDiv[index]

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!titleHeading || !tableDiv) continue
      const year = titleHeading.getGenericElementsByTagName('span')[0]?.innerText
      if (!year) continue
      const tableEl = tableDiv.getGenericElementsByTagName('table')[0]
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!tableEl) continue

      const table = convertGenericElementByTagName('table', tableEl, { headerExist: false })
      const result = table.toDictionaryArray()
      yield* Effect.logInfo(`Table: ${year}`)
      // yield* Effect.logInfo(result);
      const records = result
        .map((record) => {
          const day = record['Column1']
          if (!day) return null

          return {
            market: 'JP',
            year: Number(year),
            holiday: convertToYmd(year, day),
          } as typeof MarketHolidaySchema.types._insert
        })
        .filter((r) => r !== null)
      // yield* Effect.logInfo(records);
      results.push(...records)
    }

    return results
  })

/**
 * Converts a date string representing a holiday into a standard 'YYYY-MM-DD' format.
 *
 * @param year The year as a string.
 *
 * @param input The date string to be parsed (e.g., 'Jan. 1 (Mon.)').
 *
 * @returns A date string in 'YYYY-MM-DD' format.
 */
export const convertToYmd = (year: string, input: string): string => {
  const cleaned = input
    .replace(/\s*\(.*?\)/, '') // (Mon.)削除
    .replace('.', '') // Jan. → Jan
    .trim()

  const date = parse(cleaned, 'MMM d', new Date(), {
    locale: enUS,
  })

  if (!isValid(date)) {
    throw new Error(`Invalid date: ${input} → ${cleaned}`)
  }

  return `${year}-${format(date, 'MM-dd')}`
}
