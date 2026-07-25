import { Schema } from 'effect'

export const Paragraph = Schema.Struct({
  type: Schema.Literal('paragraph'),

  text: Schema.String.annotate({
    description: 'Paragraph text.',
  }),
}).annotate({
  description: 'A paragraph of text.',
})

export type Paragraph = Schema.Schema.Type<typeof Paragraph>
