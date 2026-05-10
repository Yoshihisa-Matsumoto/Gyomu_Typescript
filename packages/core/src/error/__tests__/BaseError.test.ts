import { describe, expect, it } from 'vitest'
import { Data } from 'effect'
import { Severity, withErrorTraits, wrapInfraError } from '../BaseError.js'
import type { AppErrorContext } from '../BaseError.js'

export class TestError extends withErrorTraits(Data.TaggedError('TestError')<AppErrorContext>, {
  severity: Severity.ERROR,
  isRetryable: () => false,
}) {}

describe('BaseError Test', () => {
  it('returns the same instance if already of ErrorType', () => {
    const original = new TestError({ message: 'x', cause: undefined })

    const result = wrapInfraError(TestError, original)

    expect(result).toBe(original)
  })

  it('uses default message when not provided', () => {
    const err = new Error('boom')

    const result = wrapInfraError(TestError, err)

    expect(result.message).toBe('boom')
  })

  it('applies message, context, details', () => {
    const err = new Error('boom')

    const result = wrapInfraError(TestError, err, () => {
      return {
        message: 'custom',
        context: 'UserRepo',
        details: { id: 1 },
      }
    })

    expect(result.message).toBe('custom')
    expect(result.context).toBe('UserRepo')
    expect(result.details).toEqual({ id: 1 })
  })

  it('keeps original error as cause', () => {
    const err = new Error('boom')

    const result = wrapInfraError(TestError, err)

    expect(result.cause).toBe(err)
  })

  it('handles non-Error values', () => {
    const result = wrapInfraError(TestError, 'string error')
    expect(result.cause).toBe('string error')
  })
})
