import { Schema } from 'effect'

/**
 * Represents an individual item in a bullet list, which may contain text and optional nested list items.
 */
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

/**
 * A schema defining a bullet list structure containing an array of bullet point objects. Each point must explicitly include a text field and supports nesting.
 */
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

/**
 * The TypeScript type definition for a bullet list object.
 */
export type GeneratedBulletList = Schema.Schema.Type<typeof GeneratedBulletList>
