import type { BulletList, BulletListItem } from '@gyomu/schema/schemas/document'

export const createTranslatedBulletList = (
  items: Array<BulletListItem> = [
    { text: 'Translated item 1', translationId: 1 },
    { text: 'Translated item 2', translationId: 2 },
  ],
): BulletList => ({
  type: 'bullet-list',
  items,
})
