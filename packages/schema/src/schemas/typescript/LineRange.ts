import { Schema } from 'effect'

export const LineRange = Schema.Struct({
  startLine: Schema.Number,
  endLine: Schema.Number,
}).annotate({
  description: 'A range of line numbers in a source file.',
})

export type LineRange = Schema.Schema.Type<typeof LineRange>
