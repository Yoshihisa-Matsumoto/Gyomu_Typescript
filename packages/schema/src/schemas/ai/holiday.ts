import { Schema } from 'effect'
import { LocalDateSchema } from '../../entity/date.js'

/**
 * Defines a holiday date range schema, containing the start and end local dates.
 */
export const HolidayRangeSchema = Schema.Struct({
  from: LocalDateSchema,
  to: LocalDateSchema,
})
