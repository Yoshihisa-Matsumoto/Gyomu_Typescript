import { Effect, Schema } from 'effect'
import { SchemaValidationError } from '../error/SchemaValidationError.js'
import type { SchemaError } from 'effect/Schema'

export const jsonString2SchemaObjectWithoutEffect = <S extends Schema.Schema<any>>(
  schema: S,
  content: string,
) =>
  Schema.decodeUnknownSync(schema as unknown as Schema.Decoder<Schema.Schema.Type<S>, never>)(
    JSON.parse(content),
  )

export const convertToSchemaObjectWithResult = <S extends Schema.Schema<any>>(
  schema: S,
  input: unknown,
  includeAllErrors: boolean = false,
) => {
  return Schema.decodeUnknownResult(Schema.toType(schema))(
    input,
    includeAllErrors ? { errors: 'all' } : {},
  )
}

export const convertToSchemaObjectWithEffect =
  (schemaName: string) =>
  <S extends Schema.Schema<any>>(schema: S, input: unknown) =>
    Schema.decodeUnknownEffect(schema)(input).pipe(
      Effect.mapError(
        (e: SchemaError) =>
          new SchemaValidationError({
            message: `Failed to decode`,
            cause: e,
            schemaName,
            phase: 'decode',
            issues: e, // ← 生の情報を保持
          }),
      ),
    )

export const convertFromSchemaObjectWithEffect =
  (schemaName: string) =>
  <S extends Schema.Schema<any>>(schema: S, input: S['Type']) =>
    Schema.encodeEffect(schema)(input).pipe(
      Effect.mapError(
        (e: SchemaError) =>
          new SchemaValidationError({
            message: `Failed to encode`,
            cause: e,
            schemaName,
            phase: 'encode',
            issues: e,
          }),
      ),
    )

export type EffectSchema = Parameters<typeof Schema.toStandardSchemaV1>[0] & Schema.Struct<any>
// export type StandardizedSchema<S extends EffectSchema> = ReturnType<
//   typeof Schema.toStandardSchemaV1<S>
// >
// export const convertToStandardSchema = <S extends EffectSchema>(schema: S) =>
//   Schema.toStandardSchemaV1(Schema.toStandardJSONSchemaV1(schema))

// export const convertToStandardSchema = <Fields extends Schema.Struct.Fields>(
//   schema: Schema.Struct<Fields>,
// ) => {
//   const jsonSchema = Schema.toStandardJSONSchemaV1(schema)

//   return Schema.toStandardSchemaV1(
//     jsonSchema as any as Parameters<typeof Schema.toStandardSchemaV1>[0],
//   )
// }
