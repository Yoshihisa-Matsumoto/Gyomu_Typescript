import { Effect, Layer, Context } from 'effect';
import { GyomuRepository } from '../GyomuRepository.js';
import { DBError } from '../../error/DBError.js';
import { LocalDate } from '../../entity/date.js';

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
  getHolidays: (from: LocalDate, to: LocalDate) => LocalDate[];
}

export class BusinessCalendarService extends Context.Service<
  BusinessCalendarService,
  {
    get: (
      market: string,
    ) => Effect.Effect<BusinessCalendar, DBError, GyomuRepository>;
  }
>()('BusinessCalendarService') {}
