import { Effect } from 'effect';
import { fetchEffect } from '../web/client.js';
import { convertGenericElementByTagName, Page } from '@gyomu/core/scraping';
import { fromPromise } from '@gyomu/shared/effect';
import { isRetryableNetworkError, NetworkError } from '@gyomu/core';
import { enUS } from 'date-fns/locale';
import { MarketHolidaySchema } from '@gyomu/core/schemas/gyomu';
import { format, isValid, parse } from 'date-fns';

export const fetchJpxHolidays = (): Effect.Effect<
  (typeof MarketHolidaySchema.types._insert)[],
  NetworkError
> =>
  Effect.gen(function* () {
    const url =
      'https://www.jpx.co.jp/english/corporate/about-jpx/calendar/index.html';
    const response = yield* fetchEffect(url);
    const page = yield* fromPromise(NetworkError, (e) => ({
      message: 'Fail to parse page',
      operation: 'request' as const,
      retryable: isRetryableNetworkError(e),
      endpoint: url,
    }))(() => Page.createFromResponse(response));
    //yield* Effect.logInfo(page);
    //console.log(JSON.stringify(page));
    const titles = page.getElementsByClassName('heading-title');
    const tablesDiv = page.getElementsByClassName('component-normal-table');
    console.log('test');
    yield* Effect.logInfo(tablesDiv);
    const results: (typeof MarketHolidaySchema.types._insert)[] = [];
    for (let index: number = 0; index < tablesDiv.length; index++) {
      const titleHeading = titles[index]!;
      const year =
        titleHeading.getGenericElementsByTagName('span')[0]?.innerText;
      const tableDiv = tablesDiv[index]!;
      const table = convertGenericElementByTagName(
        'table',
        tableDiv.getGenericElementsByTagName('table')[0]!,
        { headerExist: false },
      );
      const result = table.toDictionaryArray();
      yield* Effect.logInfo(`Table: ${year}`);
      //yield* Effect.logInfo(result);
      const records = result.map((record) => {
        const day = record['Column1'];

        return {
          market: 'JP',
          year: Number(year),
          holiday: convertToYmd(year!, day!),
        } as typeof MarketHolidaySchema.types._insert;
      });
      //yield* Effect.logInfo(records);
      results.push(...records);
    }

    return results;
  });

export const convertToYmd = (year: string, input: string): string => {
  const cleaned = input
    .replace(/\s*\(.*?\)/, '') // (Mon.)削除
    .replace('.', '') // Jan. → Jan
    .trim();

  const date = parse(cleaned, 'MMM d', new Date(), {
    locale: enUS,
  });

  if (!isValid(date)) {
    throw new Error(`Invalid date: ${input} → ${cleaned}`);
  }

  return `${year}-${format(date, 'MM-dd')}`;
};
