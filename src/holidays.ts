import { Context } from './dbclient';
import format from 'date-fns/format';
import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';
import { addMonths, isAfter, isBefore, isEqual } from 'date-fns';
import { createDateOnly } from './dateOperation';
import prisma from './dbclient';
export default class MarketDateAccess {
  private static __marketHolidays: {
    [market: string]: string[];
  } = {};

  #market: string;
  #holidays: string[] = new Array<string>();
  private constructor(market: string) {
    this.#market = market;
    console.log('__marketHolidays', MarketDateAccess.__marketHolidays);
    if (market in MarketDateAccess.__marketHolidays) {
      this.#holidays = MarketDateAccess.__marketHolidays[market];
      return;
    }
  }
  //static async getMarketAccess(market: string, ctx: Context) {
  static async getMarketAccess(market: string) {
    const access = new MarketDateAccess(market);
    await access.#initDataLoad();
    return access;
  }

  //async #initDataLoad(ctx: Context) {
  async #initDataLoad() {
    if (this.#holidays.length > 0) return;
    this.#holidays = new Array<string>();

    const holidays = await prisma.gyomu_market_holiday.findMany({
      where: {
        market: this.#market,
      },
    });
    console.log('holidays', holidays);
    holidays.forEach((row) => {
      this.#holidays.push(row.holiday);
    });
    //console.log('#holidays', this.#holidays);
    MarketDateAccess.__marketHolidays[this.#market] = this.#holidays;
  }

  isBusinessDay(targetDate: Date): boolean {
    const dayOfWeek = targetDate.getDay();
    const targetYYYYMMDD = format(targetDate, 'yyyyMMdd');
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    const holidayArray = this.#holidays.filter((val) => val === targetYYYYMMDD);
    return !holidayArray || holidayArray.length === 0;
  }

  businessDay(targetDate: Date, dayOffset: number) {
    if (dayOffset === 0)
      return this.__getNextBusinessDay(
        this.__getPreviousBusinessDay(targetDate, 1),
        1
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
    dayOffset: number = 1
  ) {
    let businessDay = createDateOnly(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      1
    );

    if (this.isBusinessDay(businessDay)) {
      if (dayOffset > 1) return this.businessDay(businessDay, dayOffset - 1);
      else return businessDay;
    }
    return this.businessDay(businessDay, dayOffset);
  }
  businessDayOfBeginningOfNextMonthWithOffset(
    targetDate: Date,
    dayOffset: number = 1
  ) {
    let businessDay = createDateOnly(
      targetDate.getFullYear() + (targetDate.getMonth() === 11 ? 1 : 0),
      targetDate.getMonth() + 2 + (targetDate.getMonth() === 11 ? -11 : 0),
      1
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
    dayOffset: number = 1
  ) {
    let businessDay = createDateOnly(
      targetDate.getFullYear() + (targetDate.getMonth() === 0 ? -1 : 0),
      targetDate.getMonth() + 1 + (targetDate.getMonth() === 0 ? 11 : -1),
      1
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
    let businessDay = createDateOnly(
      targetDate.getFullYear() + (targetDate.getMonth() === 11 ? 1 : 0),
      targetDate.getMonth() + 1 + (targetDate.getMonth() === 11 ? -11 : 1),
      1
    );
    if (dayOffset === 0) dayOffset = 1;
    return this.businessDay(businessDay, -dayOffset);
  }
  businessDayOfEndOfNextMonthWithOffset(targetDate: Date, dayOffset: number) {
    let businessDay = createDateOnly(
      targetDate.getFullYear() + (targetDate.getMonth() === 11 ? 1 : 0),
      targetDate.getMonth() + 1 + (targetDate.getMonth() === 11 ? -11 : 1),
      1
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
    dayOffset: number
  ) {
    const businessDay = createDateOnly(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      1
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
