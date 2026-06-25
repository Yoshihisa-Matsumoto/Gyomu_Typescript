import { add, format, isValid, parse } from 'date-fns'
import { Schema } from 'effect'
import { isPattern } from 'effect/Schema'
import { ValueError } from '../error/ValueError.js'
import type { Brand } from 'effect'

/**
 * Defines a schema for a local date string in YYYY-MM-DD format.
 */
export const LocalDateSchema = Schema.String.pipe(
  Schema.check(isPattern(/^\d{4}-\d{2}-\d{2}$/)),
  Schema.brand('LocalDate'),
)

/**
 * Defines a schema for a year-month string in YYYY-MM format.
 */
export const YearMonthSchema = Schema.String.pipe(
  Schema.check(isPattern(/^\d{4}-\d{2}$/)),
  Schema.brand('YearMonth'),
)

/**
 * Defines a tagged union schema for selecting between a specific daily date or a monthly period.
 */
export const TargetDateSchema = Schema.TaggedUnion({
  daily: {
    type: Schema.Literal('daily'),
    date: LocalDateSchema,
  },
  monthly: {
    type: Schema.Literal('monthly'),
    month: YearMonthSchema,
  },
})

/**
 * Represents a local date string branded as LocalDate.
 */
export type LocalDate = string & Schema.Schema<typeof LocalDateSchema>

/**
 * Represents a year-month string branded as YearMonth.
 */
export type YearMonth = string & Schema.Schema<typeof YearMonthSchema>

/**
 * Represents the TargetDate union schema (daily or monthly).
 */
export type TargetDate = Schema.Schema<typeof TargetDateSchema>

/**
 * Factory object for LocalDate validation.
 */
export const LocalDate = {
  make: (s: string) => Schema.decodeSync(LocalDateSchema)(s),
}

/**
 * Converts a LocalDate string to a Date object.
 *
 * @returns The Date object representing the given date.
 */
export const LocalDate2Date = (localDate: LocalDate): Date => {
  const parts = localDate.split('-')

  const y = Number(parts[0])
  const m = Number(parts[1])
  const d = Number(parts[2])

  return new Date(y, m - 1, d)
}

/**
 * Converts a Date object to a LocalDate string.
 *
 * @returns The formatted LocalDate string.
 */
export const Date2LocalDate = (date: Date): LocalDate => {
  return format(date, 'yyyy-MM-dd') as LocalDate
}

type DbLocalDate = string & Brand.Brand<'LocalDate'>

/**
 * Converts a LocalDate to a database-compatible date representation.
 *
 * @returns The database-formatted local date string.
 */
export function toDbLocalDate(value: LocalDate): DbLocalDate {
  return value as string as DbLocalDate
}

/**
 * Converts a Date object to a DbLocalDate.
 *
 * @returns The resulting DbLocalDate.
 */
export const Date2DbLocalDate = (date: Date): DbLocalDate => {
  return toDbLocalDate(Date2LocalDate(date))
}

/**
 * Creates a Date object from year, month, and day components.
 *
 * @returns A Date object representing the specified date.
 */
export const createDateOnly = (year: number, one_base_month: number, day: number) => {
  const dateString = `${year}-${('00' + one_base_month).slice(-2)}-${('00' + day).slice(-2)}`
  return new Date(dateString)
}

/**
 * Extracts the date portion from a Date object.
 *
 * @returns A new Date object with time zeroed out.
 */
export const extractDateOnly = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * Formats a JavaScript Date object into a YYYY-MM-DD string.
 *
 * @returns The formatted date string.
 */
export function formatDateToYmd(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Parses a YYYY-MM-DD string into a Date object, throwing a ValueError if the input is invalid.
 *
 * @returns A parsed Date object.
 *
 * @throws {ValueError} Throws if the date format is invalid or if the parsed date does not match the input string.
 */
export function parseYmdToDate(ymd: string): Date {
  const date = parse(ymd, 'yyyy-MM-dd', new Date())
  if (!isValid(date) || format(date, 'yyyy-MM-dd') !== ymd) {
    throw new ValueError({
      message: 'invalid date format',
      field: 'ymd',
      value: ymd,
      expected: 'yyyy-MM-dd',
      cause: undefined,
    })
  }
  return date
}

/**
 * Returns today's date formatted as a LocalDate.
 *
 * @returns The current date as a LocalDate string.
 */
export const getTodayAsLocalDate = (): LocalDate => {
  return Date2LocalDate(new Date())
}

/**
 * Adds a specified number of days to a Date object.
 *
 * @returns The updated Date object.
 */
export const addDays = (date: Date, numberToAdd: number): Date => {
  return add(date, { days: numberToAdd })
}

/**
 * Returns the current timestamp in ISO format.
 *
 * @returns The current ISO date string.
 */
export const getCurrentISOString = () => new Date().toISOString()
