import { Schema } from 'effect'

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
