import { Schema } from 'effect'

/**
 * Defines a schema for a range of line numbers in a source file, containing start and end line indices.
 */
export const LineRange = Schema.Struct({
  startLine: Schema.Number,
  endLine: Schema.Number,
}).annotate({
  description: 'A range of line numbers in a source file.',
})

/**
 * Represents the inferred type of the LineRange schema.
 */
export type LineRange = Schema.Schema.Type<typeof LineRange>
