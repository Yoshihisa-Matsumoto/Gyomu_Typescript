import { Context } from 'effect'
import type { Effect } from 'effect'
import type { GyomuRepository } from '../GyomuRepository.js'
import type { DBError } from '../../error/DBError.js'
import type { LocalDate } from '../../entity/date.js'

export interface BusinessCalendar {
  isBusinessDay: (targetDate: LocalDate) => boolean

  businessDay: (targetDate: LocalDate, dayOffset: number) => LocalDate

  businessDayOfBeginningMonthWithOffset: (targetDate: LocalDate, dayOffset?: number) => LocalDate

  businessDayOfBeginningOfNextMonthWithOffset: (
    targetDate: LocalDate,
    dayOffset?: number,
  ) => LocalDate

  businessDayOfBeginningOfPreviousMonthWithOffset: (
    targetDate: LocalDate,
    dayOffset?: number,
  ) => LocalDate

  businessDayOfEndMonthWithOffset: (targetDate: LocalDate, dayOffset: number) => LocalDate

  businessDayOfEndOfNextMonthWithOffset: (targetDate: LocalDate, dayOffset: number) => LocalDate

  businessDayOfEndOfPreviousMonthWithOffset: (targetDate: LocalDate, dayOffset: number) => LocalDate

  businessDayOfBeginningOfYear: (targetDate: LocalDate, dayOffset: number) => LocalDate

  businessDayOfEndOfYear: (targetDate: LocalDate, dayOffset: number) => LocalDate
  getHolidays: (from: LocalDate, to: LocalDate) => Array<LocalDate>
}

export class BusinessCalendarService extends Context.Service<
  BusinessCalendarService,
  {
    get: (market: string) => Effect.Effect<BusinessCalendar, DBError, GyomuRepository>
  }
>()('BusinessCalendarService') {}
