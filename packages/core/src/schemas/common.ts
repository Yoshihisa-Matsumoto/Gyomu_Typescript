import { Effect, Schema } from 'effect';

import { AppError, AppErrorCtor } from '../base-error.js';
import { unknownError } from '../errors.js';
import {
  AuditFields,
  EntityDefinition,
  Fields,
  PrimaryFields,
  Mutable,
  Optionalized,
} from '@gyomu/shared/entity';
import { SchemaError } from 'effect/Schema';

export type CrudSchemasBase<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = {
  readonly tags: { entity: string };
  readonly insertSchema: Insert;
  readonly selectSchema: Select;
  readonly updateSchema: Update;
  readonly updatefieldNames: string[];
};

export type CrudSchemasWithAudit<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = CrudSchemasBase<Insert, Select, Update> & {
  includeAuditFields: true;
};

export type CrudSchemasWithoutAudit<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = CrudSchemasBase<Insert, Select, Update> & {
  includeAuditFields?: false;
};

export type CrudSchemas<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> =
  | CrudSchemasWithAudit<Insert, Select, Update>
  | CrudSchemasWithoutAudit<Insert, Select, Update>;

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

export type CrudSchemaGeneratorType<
  TFields extends Fields,
  TIncludeAudit extends boolean,
> = ReturnType<typeof defineEntityCrudSchemas<TFields, TIncludeAudit>>;
//type InferSchema<S extends Schema.Schema<any>> =
//  S extends Schema.Schema<infer A> ? A : never;

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

export const defineEntityCrudSchemas = <
  TFields extends Fields,
  TIncludeAudit extends boolean,
>(
  args: EntityDefinition<TFields, TIncludeAudit>,
) => {
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
