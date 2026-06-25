import { Effect, Schema } from 'effect'
import { SchemaValidationError } from '../error/SchemaValidationError.js'
import type { SchemaError } from 'effect/Schema'

/**
 * Parses a JSON string and decodes it into a schema object synchronously.
 *
 * @param schema The target schema definition.
 *
 * @param content The JSON string to be decoded.
 *
 * @returns The decoded schema object.
 */
export const jsonString2SchemaObjectWithoutEffect = <S extends Schema.Schema<any>>(
  schema: S,
  content: string,
) =>
  Schema.decodeUnknownSync(schema as unknown as Schema.Decoder<Schema.Schema.Type<S>, never>)(
    JSON.parse(content),
  )

/**
 * Decodes an unknown input into a schema object, returning a ParseResult.
 *
 * @param schema The target schema.
 *
 * @param input The input data to decode.
 *
 * @param includeAllErrors Whether to collect all decoding errors. Defaults to false.
 *
 * @returns A ParseResult containing the decoded object or error details.
 */
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

/**
 * Creates an Effect operation to decode an unknown input into a schema object, wrapping errors in a SchemaValidationError.
 *
 * @param schemaName The identifier for the schema used for error reporting.
 *
 * @param schema The schema to decode against.
 *
 * @param input The input to decode.
 *
 * @returns An Effect performing the decode operation, failing with a SchemaValidationError on error.
 */
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

/**
 * Creates an Effect operation to encode a schema object, wrapping errors in a SchemaValidationError.
 *
 * @param schemaName The identifier for the schema used for error reporting.
 *
 * @param schema The schema definition.
 *
 * @param input The object to encode.
 *
 * @returns An Effect performing the encode operation, failing with a SchemaValidationError on error.
 */
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

/**
 * Represents a schema compatible with standard schema V1 and structurally required as a Struct.
 */
export type EffectSchema = Parameters<typeof Schema.toStandardSchemaV1>[0] & Schema.Struct<any>

/**
 * A union type defining schemas that are either arrays of structures or individual structures compatible with the system.
 */
export type EffectArrayableSchema =
  | (Parameters<typeof Schema.toStandardSchemaV1>[0] & Schema.$Array<Schema.Struct<any>>)
  | EffectSchema
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
