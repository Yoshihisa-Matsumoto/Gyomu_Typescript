import { Schema } from 'effect'

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | ReadonlyArray<JsonValue>
  | { readonly [key: string]: JsonValue }

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

export const JsonObjectSchema = Schema.Record(Schema.String, JsonValueSchema)
export type JsonObject = Schema.Schema.Type<typeof JsonObjectSchema>
