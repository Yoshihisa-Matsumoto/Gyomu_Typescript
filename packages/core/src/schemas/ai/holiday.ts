import { Schema } from 'effect';
import { LocalDateSchema } from '../../shared/entity/date.js';

export const HolidayRangeSchema = Schema.Struct({
  from: LocalDateSchema,
  to: LocalDateSchema,
});
