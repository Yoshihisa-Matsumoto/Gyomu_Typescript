import { Schema } from 'effect'

/**
 * Represents a valid JSON value, including strings, numbers, booleans, null, arrays, and objects.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | ReadonlyArray<JsonValue>
  | { readonly [key: string]: JsonValue }

/**
 * Defines an Effect Schema for valid JSON values, supporting recursive definition of arrays and objects.
 */
export const JsonValueSchema: Schema.Schema<JsonValue> = Schema.suspend(() =>
  Schema.Union([
    Schema.String,
    Schema.Number,
    Schema.Boolean,
    Schema.Null,
    Schema.Array(JsonValueSchema),
    Schema.Record(Schema.String, JsonValueSchema),
  ]),
)

/**
 * Defines an Effect Schema for a JSON object with string keys and recursive JsonValue values.
 */
export const JsonObjectSchema = Schema.Record(Schema.String, JsonValueSchema)

/**
 * Represents the type of a valid JSON object inferred from JsonObjectSchema.
 */
export type JsonObject = Schema.Schema.Type<typeof JsonObjectSchema>
