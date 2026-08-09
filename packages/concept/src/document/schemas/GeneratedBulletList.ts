import { Schema } from 'effect'

export type GeneratedBulletListItem = {
  text: string
  /**
   * Nested bullet list items.
   */
  children?: ReadonlyArray<GeneratedBulletListItem> | undefined
}

const GeneratedBulletListItem: Schema.Schema<GeneratedBulletListItem> = Schema.Struct({
  text: Schema.String.annotate({
    description: 'The text content of this bullet point.',
  }),
  children: Schema.optional(Schema.Array(Schema.suspend(() => GeneratedBulletListItem))).annotate({
    description: 'Nested bullet points. Omit this field when there are no nested bullet points.',
  }),
}).annotate({
  description:
    'A bullet point represented as an object. Each item must contain a text field and may optionally contain nested bullet points.',
})

export const GeneratedBulletList = Schema.Struct({
  type: Schema.Literal('bullet-list'),
  items: Schema.Array(GeneratedBulletListItem).annotate({
    description:
      'The bullet points. Each item must be an object with a text field, not a plain string.',
  }),
}).annotate({
  description:
    'A bullet list containing structured bullet point objects. Do not represent bullet points as plain strings.',
})

export type GeneratedBulletList = Schema.Schema.Type<typeof GeneratedBulletList>
