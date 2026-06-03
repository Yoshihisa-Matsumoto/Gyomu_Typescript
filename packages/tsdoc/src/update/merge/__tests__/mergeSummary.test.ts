import { describe, expect, test } from 'vitest'
import { mergeSummary } from '../mergeSummary.js'

describe('mergeSummary', () => {
  test('returns existing summary when action is preserve', () => {
    const result = mergeSummary({ type: 'preserve' }, {
      summary: 'Existing summary',
    } as any)

    expect(result).toBe('Existing summary')
  })

  test('returns undefined when action is preserve and summary does not exist', () => {
    const result = mergeSummary({ type: 'preserve' }, {} as any)

    expect(result).toBeUndefined()
  })

  test('returns undefined when action is delete', () => {
    const result = mergeSummary({ type: 'delete' }, {
      summary: 'Existing summary',
    } as any)

    expect(result).toBeUndefined()
  })

  test('returns replacement value when action is replace', () => {
    const result = mergeSummary(
      {
        type: 'replace',
        value: 'New summary',
      },
      {
        summary: 'Existing summary',
      } as any,
    )

    expect(result).toBe('New summary')
  })
})
