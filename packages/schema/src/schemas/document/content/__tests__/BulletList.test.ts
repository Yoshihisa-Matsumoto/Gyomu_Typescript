import { describe, expect, it } from 'vitest'

import { findBulleListItem } from '../BulletList.js'
import type { BulletList, BulletListItem } from '../BulletList.js'

describe('findBulleListItem', () => {
  it('returns a root level item', () => {
    const list: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'ab',
        },
        {
          translationId: 2,
          text: 'ab',
        },
      ],
    }

    expect(findBulleListItem(list, 2)).toBe(list.items[1])
  })

  it('returns a nested child item', () => {
    const child: BulletListItem = {
      translationId: 2,
      text: 'ab',
    }

    const list: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'ab',
          children: [child],
        },
      ],
    }

    expect(findBulleListItem(list, 2)).toBe(child)
  })

  it('returns a deeply nested item', () => {
    const grandChild: BulletListItem = {
      translationId: 3,
      text: 'ab',
    }

    const list: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'ab',
          children: [
            {
              translationId: 2,
              text: 'ab',
              children: [grandChild],
            },
          ],
        },
      ],
    }

    expect(findBulleListItem(list, 3)).toBe(grandChild)
  })

  it('returns undefined when translationId does not exist', () => {
    const list: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'ab',
        },
      ],
    }

    expect(findBulleListItem(list, 999)).toBeUndefined()
  })

  it('returns undefined for an empty list', () => {
    const list: BulletList = {
      type: 'bullet-list',
      items: [],
    }

    expect(findBulleListItem(list, 1)).toBeUndefined()
  })
})
