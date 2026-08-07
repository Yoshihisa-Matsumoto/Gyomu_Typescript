import { Schema } from 'effect'

/**
 * Represents a single item within a bullet list.
 *
 * Each item may contain nested child items, allowing hierarchical lists
 * to be represented independently of any specific output format such as Markdown.
 *
 * @param translationId A temporary identifier used to track this item during translation retries. This value must never be translated or modified.
 *
 * @param text The text content of the bullet list item.
 *
 * @param children Nested bullet list items.
 */
export type BulletListItem = {
  translationId: number
  /**
   * The text content of the bullet list item.
   */
  text: string
  /**
   * Nested bullet list items.
   */
  children?: ReadonlyArray<BulletListItem> | undefined
}

/**
 * Schema defining a single bullet list item, containing a unique translation ID, text content, and optional nested child items.
 */
export const BulletListItem: Schema.Schema<BulletListItem> = Schema.Struct({
  translationId: Schema.Number.annotate({
    description:
      'A temporary identifier used to track this item during translation retries. This value must never be translated or modified.',
  }),
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
 * An unordered list schema containing a fixed literal type identifier and an array of bullet point items.
 */
export const BulletList = Schema.Struct({
  type: Schema.Literal('bullet-list'),

  items: Schema.Array(BulletListItem).annotate({
    description: 'Bullet list items.',
  }),
}).annotate({
  description: 'An unordered list.',
})

/**
 * The inferred TypeScript type for the BulletList schema.
 */
export type BulletList = Schema.Schema.Type<typeof BulletList>

/**
 * Searches for a bullet list item within the provided BulletList by its translation ID.
 *
 * @param list The bullet list to search.
 *
 * @param translationId The unique translation ID to match.
 *
 * @returns Returns the found BulletListItem or undefined if no match is found.
 */
export const findBulleListItem = (list: BulletList, translationId: number) => {
  for (const item of list.items) {
    const foundItem = findBulleListItemFromBulletListItem(item, translationId)
    if (foundItem) return foundItem
  }
  return undefined
}

const findBulleListItemFromBulletListItem = (
  item: BulletListItem,
  translationId: number,
): BulletListItem | undefined => {
  if (item.translationId == translationId) return item
  if (item.children) {
    for (const child of item.children) {
      const foundItem = findBulleListItemFromBulletListItem(child, translationId)
      if (foundItem) return foundItem
    }
  }
  return undefined
}
