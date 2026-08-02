import { describe, expect, it, vi } from 'vitest'
import { Effect, Result } from 'effect'
import { mergeRetryContext } from '../mergeRetryContext.js'

describe('mergeRetryContext', () => {
  it('delegates to retryContextUpdater', async () => {
    const updatedContext = {
      type: 'paragraph',
      text: 'updated',
    }

    const retryContextUpdater = vi.fn(() => Effect.succeed(updatedContext))

    const result = await Effect.runPromise(
      mergeRetryContext({
        sectionId: 'test-section',
        sectionDefinition: {} as any,
        contentStrategy: {
          retryContextUpdater,
        } as any,
        currentValidation: {
          isValid: false,
          issues: [{} as any],
        },
        previousValidation: {
          isValid: false,
          issues: [{} as any],
        },
        originalContext: {
          type: 'paragraph',
          text: 'original',
        } as any,
        translatedContext: {
          type: 'paragraph',
          text: 'translated',
        } as any,
      }),
    )

    expect(result).toBe(updatedContext)

    expect(retryContextUpdater).toHaveBeenCalledTimes(1)

    expect(retryContextUpdater).toHaveBeenCalledWith({
      sectionId: 'test-section',
      sectionDefinition: {} as any,
      currentValidation: {
        isValid: false,
        issues: [{}],
      },
      previousValidation: {
        isValid: false,
        issues: [{}],
      },
      originalContext: {
        type: 'paragraph',
        text: 'original',
      },
      translatedContext: {
        type: 'paragraph',
        text: 'translated',
      },
    })
  })
  it('fails when current validation is already valid', async () => {
    const retryContextUpdater = vi.fn()

    const result = await Effect.runPromise(
      mergeRetryContext({
        sectionId: 'test-section',
        sectionDefinition: {} as any,
        contentStrategy: {
          retryContextUpdater,
        } as any,
        currentValidation: {
          isValid: true,
          issues: [],
        },
        previousValidation: undefined,
        originalContext: {
          type: 'paragraph',
        } as any,
        translatedContext: {
          type: 'paragraph',
        } as any,
      }).pipe(Effect.result),
    )

    expect(retryContextUpdater).not.toHaveBeenCalled()

    expect(Result.isFailure(result)).toBe(true)

    if (Result.isFailure(result)) {
      expect(result.failure).toMatchObject({
        phase: 'retry-context',
        sectionId: 'test-section',
        contentType: 'paragraph',
      })
    }
  })
  it('fails when previous validation is valid', async () => {
    const retryContextUpdater = vi.fn()

    const result = await Effect.runPromise(
      mergeRetryContext({
        sectionId: 'test-section',
        sectionDefinition: {} as any,
        contentStrategy: {
          retryContextUpdater,
        } as any,
        currentValidation: {
          isValid: false,
          issues: [{} as any],
        },
        previousValidation: {
          isValid: true,
          issues: [],
        },
        originalContext: {
          type: 'paragraph',
        } as any,
        translatedContext: {
          type: 'paragraph',
        } as any,
      }).pipe(Effect.result),
    )

    expect(retryContextUpdater).not.toHaveBeenCalled()

    expect(Result.isFailure(result)).toBe(true)
  })
})
