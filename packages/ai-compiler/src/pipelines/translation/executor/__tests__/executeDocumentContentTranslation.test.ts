import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer, Result } from 'effect'
import { TranslationError } from '@gyomu/schema'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import { PlatformLayer } from '@gyomu/infra'
import { retryDocumentContentTranslation } from '../executeDocumentContentTranslation.js'
import { translateDocumentContent } from '../translateDocumentContent.js'
import { mergeRetryContext } from '../mergeRetryContext.js'
import { DocumentSectionRouteId } from '../../../document/SectionPromptProvider.js'
import type { ModelRoute, ModelRouteId, RouteNode } from '@gyomu/ai'

vi.mock('../translateDocumentContent.js', () => ({
  translateDocumentContent: vi.fn(),
}))

vi.mock('../mergeRetryContext.js', () => ({
  mergeRetryContext: vi.fn(),
}))

const mockAiModelService = Layer.succeed(AiModelRoute, {} as any)
const modelRoute = {
  nodes: [{ retry: 1, registry: { fast: {} } } as any as RouteNode],
} as ModelRoute
const mockModelRoutes = Layer.succeed(
  ModelRoutes,
  new Map<ModelRouteId, ModelRoute>([[DocumentSectionRouteId, modelRoute]]),
)

describe('retryDocumentContentTranslation', () => {
  const validate = vi.fn()

  const contentStrategy = {
    definition: {
      reconciliation: {
        validate,
      },
    },
  } as any

  const args = {
    sectionId: 'test-section',
    language: 'ja',
    context: {
      type: 'paragraph',
      text: 'Original',
    },
    sectionDefinition: {
      translations: [{}],
    },

    contentStrategy,
    validationResult: undefined,
  } as const

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns translated result when first validation succeeds', async () => {
    const translated = {
      type: 'paragraph' as const,
    }

    vi.mocked(translateDocumentContent).mockReturnValue(Effect.succeed(translated))

    validate.mockReturnValue({
      isValid: true,
      issues: [],
    })

    const result = await Effect.runPromise(
      retryDocumentContentTranslation(args as any, 3).pipe(
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
        Effect.provide(mockAiModelService),
      ),
    )

    expect(result).toEqual(translated)

    expect(translateDocumentContent).toHaveBeenCalledTimes(1)
    expect(validate).toHaveBeenCalledTimes(1)
    expect(mergeRetryContext).not.toHaveBeenCalled()
  })

  it('retries once and succeeds', async () => {
    const translated1 = {
      type: 'paragraph' as const,
      text: 'Retry1',
    }

    const translated2 = {
      type: 'paragraph' as const,
      text: 'Retry2',
    }

    const updatedContext = {
      type: 'paragraph' as const,
      text: 'Updated Context',
    }

    const validation1 = {
      isValid: false,
      issues: [{ code: 'INVALID' }],
    }

    const validation2 = {
      isValid: true,
      issues: [],
    }

    vi.mocked(translateDocumentContent)
      .mockReturnValueOnce(Effect.succeed(translated1))
      .mockReturnValueOnce(Effect.succeed(translated2))

    validate.mockReturnValueOnce(validation1).mockReturnValueOnce(validation2)

    vi.mocked(mergeRetryContext)
      .mockReturnValueOnce(
        Effect.succeed({ context: updatedContext, validation: validation1 as any }),
      )
      .mockReturnValueOnce(
        Effect.succeed({ context: updatedContext, validation: validation2 as any }),
      )

    const result = await Effect.runPromise(
      retryDocumentContentTranslation(args as any, 3).pipe(
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
        Effect.provide(mockAiModelService),
      ),
    )

    expect(result).toEqual(translated2)

    expect(translateDocumentContent).toHaveBeenCalledTimes(2)
    expect(validate).toHaveBeenCalledTimes(2)
    expect(mergeRetryContext).toHaveBeenCalledTimes(1)

    expect(mergeRetryContext).toHaveBeenCalledWith({
      sectionId: 'test-section',
      sectionDefinition: args.sectionDefinition,
      contentStrategy,
      currentValidation: validation1,
      previousValidation: undefined,
      originalContext: args.context,
      translatedContext: translated1,
    })
  })

  it('passes previousValidation on second retry', async () => {
    const translated1 = { type: 'paragraph' as const, text: '1' }
    const translated2 = { type: 'paragraph' as const, text: '2' }
    const translated3 = { type: 'paragraph' as const, text: '3' }

    const updated1 = { type: 'paragraph' as const, text: 'ctx1' }
    const updated2 = { type: 'paragraph' as const, text: 'ctx2' }

    const validation1 = {
      isValid: false,
      issues: [{ code: '1' }],
    }

    const validation2 = {
      isValid: false,
      issues: [{ code: '2' }],
    }

    const validation3 = {
      isValid: true,
      issues: [],
    }

    vi.mocked(translateDocumentContent)
      .mockReturnValueOnce(Effect.succeed(translated1))
      .mockReturnValueOnce(Effect.succeed(translated2))
      .mockReturnValueOnce(Effect.succeed(translated3))

    validate
      .mockReturnValueOnce(validation1)
      .mockReturnValueOnce(validation2)
      .mockReturnValueOnce(validation3)

    vi.mocked(mergeRetryContext)
      .mockReturnValueOnce(Effect.succeed({ context: updated1, validation: validation1 as any }))
      .mockReturnValueOnce(Effect.succeed({ context: updated2, validation: validation2 as any }))

    await Effect.runPromise(
      retryDocumentContentTranslation(args as any, 5).pipe(
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
        Effect.provide(mockAiModelService),
      ),
    )

    expect(mergeRetryContext).toHaveBeenCalledTimes(2)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    expect(vi.mocked(mergeRetryContext).mock.calls[1]![0]).toMatchObject({
      previousValidation: validation1,
      currentValidation: validation2,
      originalContext: updated1,
      translatedContext: translated2,
    })
  })

  it('fails after maximum attempts', async () => {
    const translated = {
      type: 'paragraph' as const,
      text: 'Retry',
    }

    vi.mocked(translateDocumentContent).mockReturnValue(Effect.succeed(translated))

    validate.mockReturnValue({
      isValid: false,
      issues: [{ code: 'INVALID' }],
    })

    vi.mocked(mergeRetryContext).mockReturnValue(
      Effect.succeed({
        context: args.context,
        validation: { isValid: false, issues: [{ code: 'INVALID' }] } as any,
      }),
    )

    const result = await Effect.runPromise(
      retryDocumentContentTranslation(args as any, 3).pipe(
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
        Effect.provide(mockAiModelService),
        Effect.result,
      ),
    )

    expect(Result.isFailure(result)).toBe(true)

    expect(translateDocumentContent).toHaveBeenCalledTimes(3)
    expect(validate).toHaveBeenCalledTimes(3)
    expect(mergeRetryContext).toHaveBeenCalledTimes(3)

    if (Result.isFailure(result)) {
      expect(result.failure).toBeInstanceOf(TranslationError)
      expect(result.failure).toMatchObject({
        phase: 'retry',
        sectionId: 'test-section',
        contentType: 'paragraph',
      })
    }
  })
})
