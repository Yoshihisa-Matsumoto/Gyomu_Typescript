import { Schema } from 'effect'
import { SymbolIdentity } from '../SymbolIdentity.js'

export const ProtectedRegion = Schema.Struct({
  start: Schema.Number.annotate({
    description: 'The starting character index of the protected region.',
  }),

  end: Schema.Number.annotate({
    description: 'The ending character index of the protected region.',
  }),

  content: Schema.String.annotate({
    description: 'The text content within the protected region.',
  }),

  before: Schema.optional(
    SymbolIdentity.annotate({
      description: 'Optional identity of the symbol immediately preceding this region.',
    }),
  ),

  after: Schema.optional(
    SymbolIdentity.annotate({
      description: 'Optional identity of the symbol immediately following this region.',
    }),
  ),
}).annotate({
  description:
    'Defines a protected section of code, identified by its start and end positions, content, and optional surrounding context.',
})

export type ProtectedRegion = Schema.Schema.Type<typeof ProtectedRegion>
