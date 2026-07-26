import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import { PlatformLayer } from '@gyomu/infra'
import { ReadmeSectionRouteId, buildSectionItem } from '../buildSectionItem.js'
import type { ModelRoute, ModelRouteId, RouteNode } from '@gyomu/ai'

const generateText = vi.fn()

const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateText,
} as any)

const modelRoute = {
  nodes: [{ retry: 1, registry: { fast: {} } } as any as RouteNode],
} as ModelRoute
const mockModelRoutes = Layer.succeed(
  ModelRoutes,
  new Map<ModelRouteId, ModelRoute>([[ReadmeSectionRouteId, modelRoute]]),
)

describe('buildSectionItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    generateText.mockReturnValue(
      Effect.succeed({
        message: {
          text: 'Hello1',
        } as any,
      }),
    )
  })

  it('renders the prompt and invokes generateObject', async () => {
    const context = {
      knowledge: {
        technical: {
          dependencies: ['Mission'],
          compatibility: ['abca'],
        },
      },
    } as any
    const retryOption = {
      maxAttempts: 3,
    } as any

    const result = await Effect.runPromise(
      buildSectionItem('dependencies', context, retryOption).pipe(
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
        Effect.provide(mockAiModelService),
      ),
    )

    expect(result).toBe('Hello1')

    expect(generateText).toHaveBeenCalledTimes(1)
  })
})
