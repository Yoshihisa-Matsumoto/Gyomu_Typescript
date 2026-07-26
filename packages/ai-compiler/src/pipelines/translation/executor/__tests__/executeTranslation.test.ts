import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import { MessageRole } from '@gyomu/schema/conversation'
import { PlatformLayer } from '@gyomu/infra'
import { TranslationResultSchema } from '@gyomu/schema/schemas/document'
import { loadPrompt } from '../../prompt/index.js'
import { TranslationRouteId, executeTranslation } from '../executeTranslation.js'
import type { TranslationRequest, TranslationResult } from '@gyomu/schema/schemas/document'
import type { ModelRoute, ModelRouteId, RouteNode } from '@gyomu/ai'

vi.mock('../../prompt/index.js', () => ({
  loadPrompt: vi.fn(),
}))

const generateObject = vi.fn()

const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject,
} as any)

const modelRoute = {
  nodes: [{ retry: 1, registry: { fast: {} } } as any as RouteNode],
} as ModelRoute
const mockModelRoutes = Layer.succeed(
  ModelRoutes,
  new Map<ModelRouteId, ModelRoute>([[TranslationRouteId, modelRoute]]),
)

describe('executeTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(loadPrompt).mockReturnValue(Effect.succeed(`Translation:{{TARGET_LANGUAGE}}`))

    generateObject.mockReturnValue(
      Effect.succeed({
        object: [
          {
            id: 'testId',
            translation: 'こんにちは',
          },
        ] satisfies TranslationResult,
      }),
    )
  })

  it('renders the prompt and invokes generateObject', async () => {
    const context = {
      targetLanguage: 'ja',
      translations: [{ id: 'testId', source: 'Hello' }],
    } as TranslationRequest

    const retryOption = {
      maxAttempts: 3,
    } as any

    const result = await Effect.runPromise(
      executeTranslation('test', context, retryOption).pipe(
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
        Effect.provide(mockAiModelService),
      ),
    )

    expect(result.length).toBe(1)
    expect(result).toMatchObject([
      {
        id: 'testId',
        translation: 'こんにちは',
      },
    ])

    expect(loadPrompt).toHaveBeenCalledWith('translation.md')

    expect(generateObject).toHaveBeenCalledTimes(1)

    expect(generateObject).toHaveBeenCalledWith({
      routeId: TranslationRouteId,
      key: 'fast',
      messages: [
        {
          id: '1',
          role: MessageRole.user,
          content: `Translation:ja`,
        },
      ],
      schema: TranslationResultSchema,
      retryOption,
    })
  })
})
