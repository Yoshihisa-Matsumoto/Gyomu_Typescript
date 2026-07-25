import { Schema } from 'effect'

export const BulletList = Schema.Struct({
  type: Schema.Literal('bullet-list'),

  items: Schema.Array(Schema.String).annotate({
    description: 'Bullet list items.',
  }),
}).annotate({
  description: 'An unordered list.',
})

export type BulletList = Schema.Schema.Type<typeof BulletList>
