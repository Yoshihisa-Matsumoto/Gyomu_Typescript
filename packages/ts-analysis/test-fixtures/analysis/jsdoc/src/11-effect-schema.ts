import { Schema } from 'effect'

/**
 * Defines a range of line numbers in a source file, consisting of a starting line number and an ending line number.
 */
export const LineRange = Schema.Struct({
  startLine: Schema.Number,
  endLine: Schema.Number,
}).annotate({
  description: 'A range of line numbers in a source file.',
})

/**
 * The inferred TypeScript type for the LineRange schema.
 */
export type LineRange = Schema.Schema.Type<typeof LineRange>
