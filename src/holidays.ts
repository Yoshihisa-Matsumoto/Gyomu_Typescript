import { addDays, subDays } from 'date-fns';
import { addMonths, isBefore, isEqual } from 'date-fns';
import { createDateOnly, formatDateToYmd } from './dateOperation.js';

import { Effect } from 'effect';
import { GyomuRepository } from './effect/gyomu/gyomuRepository.js';
import { DBError } from './errors.js';
export default class MarketDateAccess {
  private static __marketHolidays: {
    [market: string]: string[];
  } = {};

  #market: string;
  #holidays: string[] = new Array<string>();
  private constructor(market: string) {
    this.#market = market;
    //console.log('__marketHolidays', MarketDateAccess.__marketHolidays);
    if (market in MarketDateAccess.__marketHolidays) {
      this.#holidays = MarketDateAccess.__marketHolidays[market];
      return;
    }
  }
  //static async getMarketAccess(market: string, ctx: Context) {
  static getMarketAccess(
    market: string,
  ): Effect.Effect<MarketDateAccess, DBError, GyomuRepository> {
    const access = new MarketDateAccess(market);
    return access.#initDataLoad().pipe(Effect.map(() => access));
  }

  //async #initDataLoad(ctx: Context) {
  #initDataLoad(): Effect.Effect<boolean, DBError, GyomuRepository> {
    if (this.#holidays.length > 0) return Effect.succeed(true);
    this.#holidays = new Array<string>();
    const market = this.#market;
    const holiday = this.#holidays;
    return Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      return yield* repo.marketHoliday.findByMarket(market);
    }).pipe(
      Effect.map((holidays) => {
        holidays.forEach((row) => {
          holiday.push(row.holiday);
        });
        MarketDateAccess.__marketHolidays[market] = holiday;
        return true;
      }),
    );
    // return genericDBFunction<gyomu_market_holiday[]>(
    //   'load gyomu_market_holiday',
    //   () =>
    //     prisma.gyomu_market_holiday.findMany({
    //       where: { market: this.#market },
    //     }),
    //   [],
    // ).map((holidays) => {
    //   holidays.forEach((row) => {
    //     this.#holidays.push(row.holiday);
    //   });

    //   MarketDateAccess.__marketHolidays[this.#market] = this.#holidays;
    //   return true;
    // });
  }

  isBusinessDay(targetDate: Date): boolean {
    const dayOfWeek = targetDate.getDay();
    const targetYmd = formatDateToYmd(targetDate);
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    const holidayArray = this.#holidays.filter((val) => val === targetYmd);
    return !holidayArray || holidayArray.length === 0;
  }

  businessDay(targetDate: Date, dayOffset: number) {
    if (dayOffset === 0)
      return this.__getNextBusinessDay(
        this.__getPreviousBusinessDay(targetDate, 1),
        1,
      );
    if (dayOffset > 0) return this.__getNextBusinessDay(targetDate, dayOffset);
    return this.__getPreviousBusinessDay(targetDate, -dayOffset);
  }

  __getNextBusinessDay(targetDate: Date, dayOffset: number) {
    let businessDay = targetDate;
    while (dayOffset > 0) {
      businessDay = addDays(businessDay, 1);
      if (this.isBusinessDay(businessDay)) dayOffset--;
    }
    return businessDay;
  }
  __getPreviousBusinessDay(targetDate: Date, dayOffset: number) {
    let businessDay = targetDate;
    while (dayOffset > 0) {
      businessDay = subDays(businessDay, 1);
      if (this.isBusinessDay(businessDay)) dayOffset--;
    }
    return businessDay;
  }
  businessDayOfBeginningMonthWithOffset(
    targetDate: Date,
    dayOffset: number = 1,
  ) {
    const businessDay = createDateOnly(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      1,
    );

    if (this.isBusinessDay(businessDay)) {
      if (dayOffset > 1) return this.businessDay(businessDay, dayOffset - 1);
      else return businessDay;
    }
    return this.businessDay(businessDay, dayOffset);
  }
  businessDayOfBeginningOfNextMonthWithOffset(
    targetDate: Date,
    dayOffset: number = 1,
  ) {
    const businessDay = createDateOnly(
      targetDate.getFullYear() + (targetDate.getMonth() === 11 ? 1 : 0),
      targetDate.getMonth() + 2 + (targetDate.getMonth() === 11 ? -11 : 0),
      1,
    );
    let result = businessDay;
    if (dayOffset === 0) dayOffset = 1;
    if (this.isBusinessDay(businessDay)) {
      if (dayOffset > 1) result = this.businessDay(businessDay, dayOffset - 1);
    } else result = this.businessDay(businessDay, dayOffset);

    // if (isEqual(result, targetDate) || isAfter(targetDate, result)) {
    //   businessDay = addMonths(businessDay, 1);

    //   if (this.isBusinessDay(businessDay)) {
    //     if (dayOffset > 1)
    //       result = this.businessDay(businessDay, dayOffset - 1);
    //   } else result = this.businessDay(businessDay, dayOffset);
    // }

    return result;
  }

  businessDayOfBeginningOfPreviousMonthWithOffset(
    targetDate: Date,
    dayOffset: number = 1,
  ) {
    const businessDay = createDateOnly(
      targetDate.getFullYear() + (targetDate.getMonth() === 0 ? -1 : 0),
      targetDate.getMonth() + 1 + (targetDate.getMonth() === 0 ? 11 : -1),
      1,
    );
    let result = businessDay;
    if (this.isBusinessDay(businessDay)) {
      if (dayOffset > 1) result = this.businessDay(businessDay, dayOffset - 1);
    } else result = this.businessDay(businessDay, dayOffset);

    // if (isEqual(result, targetDate) || isAfter(targetDate, result)) {
    //   businessDay = addMonths(businessDay, 1);

    //   if (this.isBusinessDay(businessDay)) {
    //     if (dayOffset > 1)
    //       result = this.businessDay(businessDay, dayOffset - 1);
    //   } else result = this.businessDay(businessDay, dayOffset);
    // }
    return result;
  }

  businessDayOfEndMonthWithOffset(targetDate: Date, dayOffset: number) {
    const businessDay = createDateOnly(
      targetDate.getFullYear() + (targetDate.getMonth() === 11 ? 1 : 0),
      targetDate.getMonth() + 1 + (targetDate.getMonth() === 11 ? -11 : 1),
      1,
    );
    if (dayOffset === 0) dayOffset = 1;
    return this.businessDay(businessDay, -dayOffset);
  }
  businessDayOfEndOfNextMonthWithOffset(targetDate: Date, dayOffset: number) {
    let businessDay = createDateOnly(
      targetDate.getFullYear() + (targetDate.getMonth() === 11 ? 1 : 0),
      targetDate.getMonth() + 1 + (targetDate.getMonth() === 11 ? -11 : 1),
      1,
    );
    if (dayOffset === 0) dayOffset = 1;
    let result = this.businessDay(businessDay, -dayOffset);
    if (isEqual(targetDate, result) || isBefore(targetDate, result)) {
      businessDay = addMonths(businessDay, 1);
      result = this.businessDay(businessDay, -dayOffset);
    }
    return result;
  }

  businessDayOfEndOfPreviousMonthWithOffset(
    targetDate: Date,
    dayOffset: number,
  ) {
    const businessDay = createDateOnly(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      1,
    );
    if (dayOffset === 0) dayOffset = 1;
    return this.businessDay(businessDay, -dayOffset);
  }
  businessDayOfBeginningOfYear(targetDate: Date, dayOffset: number) {
    const businessDay = createDateOnly(targetDate.getFullYear(), 1, 1);
    if (this.isBusinessDay(businessDay))
      return this.businessDay(businessDay, dayOffset - 1);
    return this.businessDay(businessDay, dayOffset);
  }
  businessDayOfEndOfYear(targetDate: Date, dayOffset: number) {
    const businessDay = createDateOnly(targetDate.getFullYear() + 1, 1, 1);
    if (dayOffset === 0) dayOffset = 1;
    return this.businessDay(businessDay, -dayOffset);
  }
}
