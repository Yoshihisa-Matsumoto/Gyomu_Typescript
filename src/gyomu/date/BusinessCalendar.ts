import { addDays, subDays } from 'date-fns';
import { addMonths, isBefore, isEqual } from 'date-fns';
import {
  createDateOnly,
  formatDateToYmd,
} from '../../infrastructure/date/dateConverter.js';

import { Effect, Layer, ServiceMap } from 'effect';
import { GyomuRepository } from '../GyomuRepository.js';
import { DBError, GyomuError } from '../../errors.js';
import { fromSync } from '../../shared/effect/core.js';
import {
  Date2LocalDate,
  LocalDate,
  LocalDate2Date,
} from '../../schemas/date.js';

export interface BusinessCalendar {
  isBusinessDay: (targetDate: LocalDate) => boolean;

  businessDay: (targetDate: LocalDate, dayOffset: number) => LocalDate;

  businessDayOfBeginningMonthWithOffset: (
    targetDate: LocalDate,
    dayOffset?: number,
  ) => LocalDate;

  businessDayOfBeginningOfNextMonthWithOffset: (
    targetDate: LocalDate,
    dayOffset?: number,
  ) => LocalDate;

  businessDayOfBeginningOfPreviousMonthWithOffset: (
    targetDate: LocalDate,
    dayOffset?: number,
  ) => LocalDate;

  businessDayOfEndMonthWithOffset: (
    targetDate: LocalDate,
    dayOffset: number,
  ) => LocalDate;

  businessDayOfEndOfNextMonthWithOffset: (
    targetDate: LocalDate,
    dayOffset: number,
  ) => LocalDate;

  businessDayOfEndOfPreviousMonthWithOffset: (
    targetDate: LocalDate,
    dayOffset: number,
  ) => LocalDate;

  businessDayOfBeginningOfYear: (
    targetDate: LocalDate,
    dayOffset: number,
  ) => LocalDate;

  businessDayOfEndOfYear: (
    targetDate: LocalDate,
    dayOffset: number,
  ) => LocalDate;
}
class BusinessCalendarImpl implements BusinessCalendar {
  private static __marketHolidays: {
    [market: string]: string[];
  } = {};

  #market: string;
  #holidays: string[] = new Array<string>();
  private constructor(market: string) {
    this.#market = market;
    //console.log('__marketHolidays', MarketDateAccess.__marketHolidays);
    if (market in BusinessCalendarImpl.__marketHolidays) {
      this.#holidays = BusinessCalendarImpl.__marketHolidays[market];
      return;
    }
  }
  //static async getMarketAccess(market: string, ctx: Context) {
  static getMarketAccess(
    market: string,
  ): Effect.Effect<BusinessCalendar, DBError, GyomuRepository> {
    const access = new BusinessCalendarImpl(market);
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
        BusinessCalendarImpl.__marketHolidays[market] = holiday;
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

  isBusinessDay(targetDate: LocalDate): boolean {
    return this.__isBusinessDay(LocalDate2Date(targetDate));
  }
  __isBusinessDay(targetDate: Date): boolean {
    const dayOfWeek = targetDate.getDay();
    const targetYmd = formatDateToYmd(targetDate);
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    const holidayArray = this.#holidays.filter((val) => val === targetYmd);
    return !holidayArray || holidayArray.length === 0;
  }

  businessDay(targetDate: LocalDate, dayOffset: number): LocalDate {
    return Date2LocalDate(
      this.__getBusinessDay(LocalDate2Date(targetDate), dayOffset),
    );
  }
  __getBusinessDay(targetDate: Date, dayOffset: number): Date {
    if (dayOffset === 0)
      return this.__getNextBusinessDay(
        this.__getPreviousBusinessDay(targetDate, 1),
        1,
      );
    if (dayOffset > 0) return this.__getNextBusinessDay(targetDate, dayOffset);
    return this.__getPreviousBusinessDay(targetDate, -dayOffset);
  }

  __getNextBusinessDay(targetDate: Date, dayOffset: number): Date {
    let businessDay = targetDate;
    while (dayOffset > 0) {
      businessDay = addDays(businessDay, 1);
      if (this.__isBusinessDay(businessDay)) dayOffset--;
    }
    return businessDay;
  }
  __getPreviousBusinessDay(targetDate: Date, dayOffset: number): Date {
    let businessDay = targetDate;
    while (dayOffset > 0) {
      businessDay = subDays(businessDay, 1);
      if (this.__isBusinessDay(businessDay)) dayOffset--;
    }
    return businessDay;
  }
  businessDayOfBeginningMonthWithOffset(
    targetDate: LocalDate,
    dayOffset: number = 1,
  ) {
    // const businessDay = createDateOnly(
    //   targetDate.getFullYear(),
    //   targetDate.getMonth() + 1,
    //   1,
    // );
    const businessDay = (targetDate.substring(0, 8) + '01') as LocalDate;

    if (this.isBusinessDay(businessDay)) {
      if (dayOffset > 1) return this.businessDay(businessDay, dayOffset - 1);
      else return businessDay;
    }
    return this.businessDay(businessDay, dayOffset);
  }
  businessDayOfBeginningOfNextMonthWithOffset(
    targetDate: LocalDate,
    dayOffset: number = 1,
  ) {
    return Date2LocalDate(
      this.__businessDayOfBeginningOfNextMonthWithOffset(
        LocalDate2Date(targetDate),
        dayOffset,
      ),
    );
  }
  __businessDayOfBeginningOfNextMonthWithOffset(
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
    if (this.__isBusinessDay(businessDay)) {
      if (dayOffset > 1)
        result = this.__getBusinessDay(businessDay, dayOffset - 1);
    } else result = this.__getBusinessDay(businessDay, dayOffset);

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
    targetDate: LocalDate,
    dayOffset: number = 1,
  ) {
    return Date2LocalDate(
      this.__businessDayOfBeginningOfPreviousMonthWithOffset(
        LocalDate2Date(targetDate),
        dayOffset,
      ),
    );
  }
  __businessDayOfBeginningOfPreviousMonthWithOffset(
    targetDate: Date,
    dayOffset: number = 1,
  ) {
    const businessDay = createDateOnly(
      targetDate.getFullYear() + (targetDate.getMonth() === 0 ? -1 : 0),
      targetDate.getMonth() + 1 + (targetDate.getMonth() === 0 ? 11 : -1),
      1,
    );
    let result = businessDay;
    if (this.__isBusinessDay(businessDay)) {
      if (dayOffset > 1)
        result = this.__getBusinessDay(businessDay, dayOffset - 1);
    } else result = this.__getBusinessDay(businessDay, dayOffset);

    // if (isEqual(result, targetDate) || isAfter(targetDate, result)) {
    //   businessDay = addMonths(businessDay, 1);

    //   if (this.isBusinessDay(businessDay)) {
    //     if (dayOffset > 1)
    //       result = this.businessDay(businessDay, dayOffset - 1);
    //   } else result = this.businessDay(businessDay, dayOffset);
    // }
    return result;
  }

  businessDayOfEndMonthWithOffset(targetDate: LocalDate, dayOffset: number) {
    return Date2LocalDate(
      this.__businessDayOfEndMonthWithOffset(
        LocalDate2Date(targetDate),
        dayOffset,
      ),
    );
  }
  __businessDayOfEndMonthWithOffset(targetDate: Date, dayOffset: number) {
    const businessDay = createDateOnly(
      targetDate.getFullYear() + (targetDate.getMonth() === 11 ? 1 : 0),
      targetDate.getMonth() + 1 + (targetDate.getMonth() === 11 ? -11 : 1),
      1,
    );
    if (dayOffset === 0) dayOffset = 1;
    return this.__getBusinessDay(businessDay, -dayOffset);
  }
  businessDayOfEndOfNextMonthWithOffset(
    targetDate: LocalDate,
    dayOffset: number,
  ) {
    return Date2LocalDate(
      this.__businessDayOfEndOfNextMonthWithOffset(
        LocalDate2Date(targetDate),
        dayOffset,
      ),
    );
  }
  __businessDayOfEndOfNextMonthWithOffset(targetDate: Date, dayOffset: number) {
    let businessDay = createDateOnly(
      targetDate.getFullYear() + (targetDate.getMonth() === 11 ? 1 : 0),
      targetDate.getMonth() + 1 + (targetDate.getMonth() === 11 ? -11 : 1),
      1,
    );
    if (dayOffset === 0) dayOffset = 1;
    let result = this.__getBusinessDay(businessDay, -dayOffset);
    if (isEqual(targetDate, result) || isBefore(targetDate, result)) {
      businessDay = addMonths(businessDay, 1);
      result = this.__getBusinessDay(businessDay, -dayOffset);
    }
    return result;
  }

  businessDayOfEndOfPreviousMonthWithOffset(
    targetDate: LocalDate,
    dayOffset: number,
  ) {
    return Date2LocalDate(
      this.__businessDayOfEndOfPreviousMonthWithOffset(
        LocalDate2Date(targetDate),
        dayOffset,
      ),
    );
  }
  __businessDayOfEndOfPreviousMonthWithOffset(
    targetDate: Date,
    dayOffset: number,
  ) {
    const businessDay = createDateOnly(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      1,
    );
    if (dayOffset === 0) dayOffset = 1;
    return this.__getBusinessDay(businessDay, -dayOffset);
  }
  businessDayOfBeginningOfYear(targetDate: LocalDate, dayOffset: number) {
    return Date2LocalDate(
      this.__businessDayOfBeginningOfYear(
        LocalDate2Date(targetDate),
        dayOffset,
      ),
    );
  }
  __businessDayOfBeginningOfYear(targetDate: Date, dayOffset: number) {
    const businessDay = createDateOnly(targetDate.getFullYear(), 1, 1);
    if (this.__isBusinessDay(businessDay))
      return this.__getBusinessDay(businessDay, dayOffset - 1);
    return this.__getBusinessDay(businessDay, dayOffset);
  }
  businessDayOfEndOfYear(targetDate: LocalDate, dayOffset: number) {
    return Date2LocalDate(
      this.__businessDayOfEndOfYear(LocalDate2Date(targetDate), dayOffset),
    );
  }
  __businessDayOfEndOfYear(targetDate: Date, dayOffset: number) {
    const businessDay = createDateOnly(targetDate.getFullYear() + 1, 1, 1);
    if (dayOffset === 0) dayOffset = 1;
    return this.__getBusinessDay(businessDay, -dayOffset);
  }
}

export class BusinessCalendarService extends ServiceMap.Service<
  BusinessCalendarService,
  {
    get: (
      market: string,
    ) => Effect.Effect<BusinessCalendar, DBError, GyomuRepository>;
  }
>()('MarketDateService', {
  make: fromSync(
    GyomuError,
    'Failed to create MarketDateService',
  )(() => {
    const cache = new Map<string, BusinessCalendar>();
    return {
      get: (market: string) => {
        if (cache.has(market)) return Effect.succeed(cache.get(market)!);
        return Effect.gen(function* () {
          const access = yield* BusinessCalendarImpl.getMarketAccess(market);

          cache.set(market, access);
          return access;
        });
      },
    };
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}
