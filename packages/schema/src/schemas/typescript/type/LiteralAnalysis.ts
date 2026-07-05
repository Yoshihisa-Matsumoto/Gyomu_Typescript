import { Schema } from 'effect'

/**
 * Represents a literal type value.
 */
export const LiteralAnalysis = Schema.Struct({
  /**
   * The classification of this structure.
   */
  kind: Schema.Literal('literal').annotate({
    description: 'The classification of this structure.',
  }),

  /**
   * The literal value.
   */
  elementValue: Schema.String.annotate({
    description: 'The literal value.',
  }),
}).annotate({
  description: 'Represents a literal type value.',
})

export type LiteralAnalysis = typeof LiteralAnalysis.Type
