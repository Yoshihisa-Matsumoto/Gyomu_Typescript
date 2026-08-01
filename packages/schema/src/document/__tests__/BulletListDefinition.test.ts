import { describe, expect, it } from 'vitest'

import { validateBulletList } from '../BulletListDefinition.js'
import type { BulletList } from '../../schemas/document/index.js'

describe('validateBulletList', () => {
  it('returns valid when structure is preserved', () => {
    const source: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'ab',
          children: [
            {
              translationId: 2,
              text: 'ab',
            },
          ],
        },
      ],
    }

    const destination: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'ab',
          children: [
            {
              translationId: 2,
              text: 'ab',
            },
          ],
        },
      ],
    }

    expect(validateBulletList(source, destination)).toEqual({
      issues: [],
      isValid: true,
    })
  })

  it('returns issue when root item count changes', () => {
    const source: BulletList = {
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

    const destination: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'ab',
        },
      ],
    }

    const result = validateBulletList(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]).toMatchObject({
      code: 'BULLET_LIST_ITEM_COUNT_CHANGED',
      details: {
        sourceCount: '2',
        translatedCount: '1',
      },
    })
  })

  it('returns issue when root translationId does not match', () => {
    const source: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'ab',
        },
      ],
    }

    const destination: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 999,
          text: 'ab',
        },
      ],
    }

    const result = validateBulletList(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues[0]).toMatchObject({
      code: 'BULLET_LIST_ITEM_TRANSLATIONID_MISMATCH',
    })
  })

  it('returns issue when child item count changes', () => {
    const source: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'ab',
          children: [
            {
              translationId: 2,
              text: 'ab',
            },
          ],
        },
      ],
    }

    const destination: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'ab',
          children: [],
        },
      ],
    }

    const result = validateBulletList(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues[0]).toMatchObject({
      code: 'BULLET_LIST_ITEM_COUNT_CHANGED',
      translationId: 1,
      details: {
        sourceCount: '1',
        translatedCount: '0',
      },
    })
  })

  it('returns issue when child translationId does not match', () => {
    const source: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'ab',
          children: [
            {
              translationId: 2,
              text: 'ab',
            },
          ],
        },
      ],
    }

    const destination: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'ab',
          children: [
            {
              translationId: 999,
              text: 'ab',
            },
          ],
        },
      ],
    }

    const result = validateBulletList(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues[0]).toMatchObject({
      code: 'BULLET_LIST_ITEM_TRANSLATIONID_MISMATCH',
      translationId: 1,
    })
  })

  it('validates deeply nested children', () => {
    const source: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'ab',
          children: [
            {
              translationId: 2,
              text: 'ab',
              children: [
                {
                  translationId: 3,
                  text: 'ab',
                },
              ],
            },
          ],
        },
      ],
    }

    const destination: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'ab',
          children: [
            {
              translationId: 2,
              text: 'ab',
              children: [
                {
                  translationId: 999,
                  text: 'ab',
                },
              ],
            },
          ],
        },
      ],
    }

    const result = validateBulletList(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues[0]).toMatchObject({
      code: 'BULLET_LIST_ITEM_TRANSLATIONID_MISMATCH',
      translationId: 2,
    })
  })
})
