import { Schema } from 'effect'

/**
 * Represents a single item within a bullet list.
 *
 * Each item may contain nested child items, allowing hierarchical lists
 * to be represented independently of any specific output format such as Markdown.
 */
export type BulletListItem = {
  /**
   * The text content of the bullet list item.
   */
  text: string
  /**
   * Nested bullet list items.
   */
  children?: ReadonlyArray<BulletListItem> | undefined
}

export const BulletListItem: Schema.Schema<BulletListItem> = Schema.Struct({
  text: Schema.String.annotate({
    description: 'The text content of the bullet list item.',
  }),
  children: Schema.optional(Schema.Array(Schema.suspend(() => BulletListItem))).annotate({
    description: 'Nested bullet list items.',
  }),
}).annotate({
  description: 'A single bullet list item.',
})

/**
 * Defines an unordered list schema containing a fixed literal type identifier and an array of bullet point strings.
 */
export const BulletList = Schema.Struct({
  type: Schema.Literal('bullet-list'),

  items: Schema.Array(Schema.String).annotate({
    description: 'Bullet list items.',
  }),
}).annotate({
  description: 'An unordered list.',
})

/**
 * The inferred type for the BulletList schema.
 */
export type BulletList = Schema.Schema.Type<typeof BulletList>
