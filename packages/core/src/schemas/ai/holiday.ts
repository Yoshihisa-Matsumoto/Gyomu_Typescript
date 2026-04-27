import { Schema } from 'effect';
import { LocalDateSchema } from '@gyomu/shared/entity';

export const HolidayRangeSchema = Schema.Struct({
  from: LocalDateSchema,
  to: LocalDateSchema,
});
