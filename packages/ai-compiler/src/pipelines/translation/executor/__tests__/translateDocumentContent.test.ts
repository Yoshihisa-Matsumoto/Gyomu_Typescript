import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import { MessageRole } from '@gyomu/schema/conversation'
import { Paragraph } from '@gyomu/schema/schemas/document'
import { PlatformLayer } from '@gyomu/infra'
import { TranslationError } from '@gyomu/schema'
import { buildTranslationPrompt } from '../buildTranslationPrompt.js'
import { translateDocumentContent } from '../translateDocumentContent.js'
import { DocumentSectionRouteId } from '../../../document/SectionPromptProvider.js'
import type { RetryOption } from '@gyomu/schema'
import type { ModelRoute, ModelRouteId, RouteNode } from '@gyomu/ai'

vi.mock('../buildTranslationPrompt.js', () => ({ buildTranslationPrompt: vi.fn() }))

const generateObject = vi.fn()

const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject,
} as any)
const modelRoute = {
  nodes: [{ retry: 1, registry: { fast: {} } } as any as RouteNode],
} as ModelRoute
const mockModelRoutes = Layer.succeed(
  ModelRoutes,
  new Map<ModelRouteId, ModelRoute>([[DocumentSectionRouteId, modelRoute]]),
)

describe('translateDocumentContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(buildTranslationPrompt).mockReturnValue(Effect.succeed('Translation prompt'))
    generateObject.mockReturnValue(
      Effect.succeed({
        object: {
          type: 'paragraph',
          text: 'Translated text',
        },
      }),
    )
  })

  it('builds translation prompt and invokes generateObject', async () => {
    const context = {
      type: 'paragraph',
      text: 'Original text',
    } as any

    const retryOption = {
      maxAttempts: 3,
    } satisfies RetryOption

    const contentStrategy = {
      definition: {
        schema: Paragraph,
      },
    } as any

    const sectionDefinition = {
      id: 'overview',
    } as any

    const result = await Effect.runPromise(
      translateDocumentContent({
        language: 'ja',
        context,
        sectionDefinition,
        contentStrategy,
        validationResult: undefined,
        retryOption,
      }).pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
      ),
    )

    expect(result).toEqual({
      type: 'paragraph',
      text: 'Translated text',
    })

    expect(generateObject).toHaveBeenCalledTimes(1)

    expect(generateObject).toHaveBeenCalledWith({
      routeId: DocumentSectionRouteId,
      key: 'fast',
      messages: [
        {
          id: '1',
          role: MessageRole.user,
          content: expect.any(String),
        },
      ],
      schema: Paragraph,
      retryOption,
    })
  })
  it('wraps generateObject error into TranslationError', async () => {
    generateObject.mockReturnValue(Effect.fail(new Error('AI failed')))

    const result = await Effect.runPromise(
      translateDocumentContent({
        language: 'ja',
        context: {
          type: 'paragraph',
        },
        sectionDefinition: {
          id: 'overview',
        } as any,
        contentStrategy: {
          definition: {
            schema: Paragraph,
          },
        } as any,
        validationResult: undefined,
      }).pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
        Effect.result,
      ),
    )

    expect(result._tag).toBe('Failure')

    if (result._tag === 'Failure') {
      expect(result.failure).toBeInstanceOf(TranslationError)
      expect(result.failure).toMatchObject({
        phase: 'translate',
        contentType: 'paragraph',
        sectionId: 'overview',
      })
    }
  })
})
