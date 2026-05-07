import { addDays, subDays } from 'date-fns';
import { addMonths, isBefore, isEqual } from 'date-fns';

import { Effect, Layer, Context } from 'effect';
import { GyomuRepository } from '../GyomuRepository.js';
import { DBError, GyomuError, mapGyomuReason } from '../../errors.js';
import { fromSync } from '@gyomu/shared/effect';
import {
  createDateOnly,
  formatDateToYmd,
  Date2LocalDate,
  LocalDate,
  LocalDate2Date,
} from '@gyomu/shared/entity';

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
