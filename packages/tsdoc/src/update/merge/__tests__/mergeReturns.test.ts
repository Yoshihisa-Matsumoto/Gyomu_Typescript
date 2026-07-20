import { describe, expect, test } from 'vitest'
import { mergeReturns } from '../mergeReturns.js'

describe('mergeReturns', () => {
  test('returns existing returns when action is preserve', () => {
    const result = mergeReturns({ type: 'preserve' }, {
      returns: {
        description: 'Existing return value',
      },
    } as any)

    expect(result).toEqual({
      description: 'Existing return value',
    })
  })

  test('returns undefined when action is preserve and returns does not exist', () => {
    const result = mergeReturns({ type: 'preserve' }, {} as any)

    expect(result).toBeUndefined()
  })

  test('returns undefined when action is delete', () => {
    const result = mergeReturns({ type: 'delete' }, {
      returns: {
        description: 'Existing return value',
      },
    } as any)

    expect(result).toBeUndefined()
  })

  test('creates new returns object when action is replace', () => {
    const result = mergeReturns(
      {
        type: 'replace',
        value: 'Updated return value',
      },
      {
        returns: {
          description: 'Existing return value',
        },
      } as any,
    )

    expect(result).toEqual({
      description: 'Updated return value',
    })
  })

  test('creates returns object even when existing JSDoc does not exist', () => {
    const result = mergeReturns(
      {
        type: 'replace',
        value: 'Updated return value',
      },
      undefined,
    )

    expect(result).toEqual({
      description: 'Updated return value',
    })
  })
})
