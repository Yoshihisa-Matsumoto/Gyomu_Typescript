import { Schema } from 'effect'

/**
 * Represents a schema annotation
 */
export const SchemaAnnotations = Schema.Struct({
  description: Schema.optional(Schema.String),
  title: Schema.optional(Schema.String),
  identifier: Schema.optional(Schema.String),
  examples: Schema.optional(Schema.Array(Schema.Unknown)),
}).annotate({
  description: 'Represents a schema annotation',
})

export type SchemaAnnotations = typeof SchemaAnnotations.Type
