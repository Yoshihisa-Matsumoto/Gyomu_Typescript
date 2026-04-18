import { Effect, Schema, SchemaTransformation } from 'effect';
import { decodeTo, SchemaError } from 'effect/Schema';

import { AppError, AppErrorCtor } from '../base-error.js';
import { unknownError } from '../errors.js';
import { LocalDateSchema } from './date.js';

export const jsonString2SchemaObjectWithoutEffect = <
  S extends Schema.Schema<any>,
>(
  schema: S,
  content: string,
) =>
  Schema.decodeUnknownSync(
    schema as unknown as Schema.Decoder<Schema.Schema.Type<S>, never>,
  )(JSON.parse(content));

export const convertToSchemaObjectWithEffect =
  <E extends AppError>(ErrorType: AppErrorCtor<E>, schemaName: string) =>
  <S extends Schema.Schema<any>>(schema: S, input: unknown) =>
    Schema.decodeUnknownEffect(schema)(input).pipe(
      Effect.mapError((e: SchemaError) =>
        unknownError(ErrorType, e, `Fail to decode into ${schemaName}`),
      ),
    );

export const convertFromSchemaObjectWithEffect =
  <E extends AppError>(ErrorType: AppErrorCtor<E>, schemaName: string) =>
  <S extends Schema.Schema<any>>(schema: S, input: S['Type']) =>
    Schema.encodeEffect(schema)(input).pipe(
      Effect.mapError((e: SchemaError) =>
        unknownError(ErrorType, e, `Fail to encode from ${schemaName}`),
      ),
    );

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
export type CrudSchemaGeneratorType<
  TFields extends Fields,
  TIncludeAudit extends boolean,
> = ReturnType<typeof defineEntityCrudSchemas<TFields, TIncludeAudit>>;
//type InferSchema<S extends Schema.Schema<any>> =
//  S extends Schema.Schema<infer A> ? A : never;
type Fields = Record<string, Schema.Schema<any>>;

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
  decodeTo(
    Schema.String,
    SchemaTransformation.transform({
      decode: (date) => date.toISOString(),
      encode: (str) => new Date(str),
    }),
  ),
);

// const IsoDateString = Schema.Date.pipe(
//   decodeTo(
//     Schema.String,
//     SchemaTransformation.transform({
//       decode: (date) => formatDateToYmd(date),
//       encode: (str) => parseYmdToDate(str),
//     }),
//   ),
// );
//const IsoDateString = LocalDateSchema;

export const db = {
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

type Optionalized<T extends Fields> = {
  [K in keyof T]: ReturnType<typeof Schema.optional<T[K]>>;
};

const pickFields = <T extends Fields, K extends readonly (keyof T)[]>(
  fields: T,
): Pick<T, K[number]> => {
  const keys: K = Object.keys(fields) as any as K;
  const result = {} as Pick<T, K[number]>;
  for (const key of keys) {
    result[key] = fields[key];
  }
  return result;
};

const optionalizeFields = <T extends Fields>(fields: T): Optionalized<T> => {
  const result = {} as Optionalized<T>;
  for (const key in fields) {
    result[key] = Schema.optional(fields[key]);
  }
  return result;
};

const PrimaryFields = {
  id: db.id,
};
const AuditFields = {
  modifiedAt: db.timestampString,
  modifiedBy: db.text({ maxLength: 100 }),
};

export const defineEntityCrudSchemas = <
  TFields extends Fields,
  TIncludeAudit extends boolean,
>(args: {
  fields: TFields;
  tags: {
    entity: string;
    sensitiveFields?: readonly Extract<keyof TFields, string>[];
  };
  options?: {
    includeAudit?: TIncludeAudit;
    keyMapping?: { readonly [K in keyof TFields]?: PropertyKey };
  };
}) => {
  const selectFields = {
    ...PrimaryFields,
    ...args.fields,
  };
  const selectFieldsWithAudit = {
    ...PrimaryFields,
    ...args.fields,
    ...AuditFields,
  };
  const effectiveSelectSchema = (
    args.options?.includeAudit ? selectFieldsWithAudit : selectFields
  ) as TIncludeAudit extends true
    ? typeof selectFieldsWithAudit
    : typeof selectFields;

  const updateKeys = Object.keys(args.fields);
  const insertFields = args.fields;
  const updateFields = {
    ...PrimaryFields,
    ...optionalizeFields(pickFields(args.fields)),
  };

  const auditKey = { modifiedAt: 'modified_at', modifiedBy: 'modified_by' };
  const mappingKeys = {
    ...(args.options?.keyMapping ?? {}),
    ...(args.options?.includeAudit ? auditKey : {}),
  };
  const numOfMappingKey = Object.keys(mappingKeys).length;

  const selectSchema =
    numOfMappingKey == 0
      ? Schema.Struct(effectiveSelectSchema)
      : Schema.Struct(effectiveSelectSchema).pipe(
          Schema.encodeKeys(mappingKeys),
        );
  const insertSchema =
    numOfMappingKey == 0
      ? Schema.Struct(insertFields)
      : Schema.Struct(insertFields).pipe(Schema.encodeKeys(mappingKeys));
  const updateSchema =
    numOfMappingKey == 0
      ? Schema.Struct(updateFields)
      : Schema.Struct(updateFields).pipe(Schema.encodeKeys(mappingKeys));

  return {
    selectSchema,
    insertSchema,
    updateSchema,
    types: undefined as unknown as {
      _select: Schema.Schema.Type<typeof selectSchema>;
      _insert: Mutable<Schema.Schema.Type<typeof insertSchema>>;
      _update: Mutable<Schema.Schema.Type<typeof updateSchema>>;
    },
    updatefieldNames: updateKeys,
    includeAuditFields: args.options?.includeAudit ?? false,
    fields: args.fields,
    tags: args.tags,
  };
};
