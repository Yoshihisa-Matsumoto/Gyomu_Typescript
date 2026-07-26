import { Schema } from 'effect'

/**
 * Defines a structured paragraph containing a literal type and textual content.
 */
export const Paragraph = Schema.Struct({
  type: Schema.Literal('paragraph'),

  text: Schema.String.annotate({
    description: 'Paragraph text.',
  }),
}).annotate({
  description: 'A paragraph of text.',
})

/**
 * Inferred type for the paragraph schema.
 */
export type Paragraph = Schema.Schema.Type<typeof Paragraph>
