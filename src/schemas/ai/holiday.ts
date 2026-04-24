import { Schema } from 'effect';
import { LocalDateSchema } from '../date.js';

export const HolidayRangeSchema = Schema.Struct({
  from: LocalDateSchema,
  to: LocalDateSchema,
});
