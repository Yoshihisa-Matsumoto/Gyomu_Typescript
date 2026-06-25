import { Context } from 'effect'
import type { Effect } from 'effect'
import type { GyomuRepository } from '../GyomuRepository.js'
import type { DBError } from '../../error/DBError.js'
import type { LocalDate } from '../../entity/date.js'

/**
 * Defines a calendar interface for performing business day calculations, holiday lookups, and month- or year-end adjustments.
 */
export interface BusinessCalendar {
  /**
   * Checks if the provided date is a business day.
   *
   * @returns True if the date is a business day, otherwise false.
   */
  isBusinessDay: (targetDate: LocalDate) => boolean

  /**
   * Calculates a business day relative to a given date using an offset.
   *
   * @returns The calculated business day.
   */
  businessDay: (targetDate: LocalDate, dayOffset: number) => LocalDate

  /**
   * Calculates a business day relative to the beginning of the month for a given date.
   *
   * @returns The business day at the start of the month plus any provided offset.
   */
  businessDayOfBeginningMonthWithOffset: (targetDate: LocalDate, dayOffset?: number) => LocalDate

  /**
   * Calculates a business day relative to the beginning of the next month.
   *
   * @returns The business day at the start of the next month plus any provided offset.
   */
  businessDayOfBeginningOfNextMonthWithOffset: (
    targetDate: LocalDate,
    dayOffset?: number,
  ) => LocalDate

  /**
   * Calculates a business day relative to the beginning of the previous month.
   *
   * @returns The business day at the start of the previous month plus any provided offset.
   */
  businessDayOfBeginningOfPreviousMonthWithOffset: (
    targetDate: LocalDate,
    dayOffset?: number,
  ) => LocalDate

  /**
   * Calculates a business day relative to the end of the month.
   *
   * @returns The business day at the end of the month plus any provided offset.
   */
  businessDayOfEndMonthWithOffset: (targetDate: LocalDate, dayOffset: number) => LocalDate

  /**
   * Calculates a business day relative to the end of the next month.
   *
   * @returns The business day at the end of the next month plus any provided offset.
   */
  businessDayOfEndOfNextMonthWithOffset: (targetDate: LocalDate, dayOffset: number) => LocalDate

  /**
   * Calculates a business day relative to the end of the previous month.
   *
   * @returns The business day at the end of the previous month plus any provided offset.
   */
  businessDayOfEndOfPreviousMonthWithOffset: (targetDate: LocalDate, dayOffset: number) => LocalDate

  /**
   * Calculates a business day relative to the beginning of the year.
   *
   * @returns The business day at the start of the year plus any provided offset.
   */
  businessDayOfBeginningOfYear: (targetDate: LocalDate, dayOffset: number) => LocalDate

  /**
   * Calculates a business day relative to the end of the year.
   *
   * @returns The business day at the end of the year plus any provided offset.
   */
  businessDayOfEndOfYear: (targetDate: LocalDate, dayOffset: number) => LocalDate

  /**
   * Retrieves a list of holidays within the specified date range.
   *
   * @returns An array of dates that are classified as holidays.
   */
  getHolidays: (from: LocalDate, to: LocalDate) => Array<LocalDate>
}

/**
 * A service definition for accessing business calendars by market.
 */
export class BusinessCalendarService extends Context.Service<
  BusinessCalendarService,
  {
    get: (market: string) => Effect.Effect<BusinessCalendar, DBError, GyomuRepository>
  }
>()('BusinessCalendarService') {}
