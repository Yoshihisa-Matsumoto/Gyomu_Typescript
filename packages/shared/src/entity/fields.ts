import { Schema, SchemaTransformation } from 'effect';
import { LocalDateSchema } from './date.js';

const textRequired = (option?: { minLength?: number; maxLength?: number }) => {
  if (!option) return Schema.String;
  if (!option.minLength)
    return Schema.String.check(Schema.isMaxLength(option.maxLength!));
  if (!option.maxLength)
    return Schema.String.check(Schema.isMinLength(option.minLength!));
  return Schema.String.check(
    Schema.isMaxLength(option.maxLength!),
    Schema.isMinLength(option.minLength!),
  );
};

const BigIntFromDbValue = Schema.String.pipe(
  Schema.decodeTo(
    Schema.BigInt,
    SchemaTransformation.transform({
      decode: (value) => BigInt(value),
      encode: (value) => value.toString(),
    }),
  ),
);

const IsoDateTimeString = Schema.Date.pipe(
  Schema.decodeTo(
    Schema.String,
    SchemaTransformation.transform({
      decode: (date) => date.toISOString(),
      encode: (str) => new Date(str),
    }),
  ),
);

export const schemaField = {
  id: Schema.String.check(Schema.isUUID()),
  text: textRequired,
  optionalText: (option?: { minLength?: number; maxLength?: number }) =>
    Schema.NullOr(textRequired(option)),
  int: (option?: { min?: number; max?: number }) => {
    if (!option) return Schema.Number.check(Schema.isInt32());
    if (!option.min)
      return Schema.Number.check(Schema.isLessThanOrEqualTo(option.max!));
    if (!option.max)
      return Schema.Number.check(Schema.isGreaterThanOrEqualTo(option.min!));
    return Schema.Number.check(
      Schema.isLessThanOrEqualTo(option.max!),
      Schema.isGreaterThanOrEqualTo(option.min!),
    );
  },
  bigInt: BigIntFromDbValue,
  boolean: Schema.Boolean,
  timestampString: IsoDateTimeString,
  dateString: LocalDateSchema,
  optionalBoolean: Schema.NullOr(Schema.Boolean),
  optionalTimestampString: Schema.NullOr(IsoDateTimeString),
  optionalDateString: Schema.NullOr(LocalDateSchema),
  optionalId: Schema.NullOr(Schema.String.check(Schema.isUUID())),
};

export const PrimaryFields = {
  id: schemaField.id,
};
export const AuditFields = {
  modifiedAt: schemaField.timestampString,
  modifiedBy: schemaField.text({ maxLength: 100 }),
};
