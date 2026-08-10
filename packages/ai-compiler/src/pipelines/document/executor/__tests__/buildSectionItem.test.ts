import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import { PlatformLayer } from '@gyomu/infra'
import { MessageRole } from '@gyomu/schema/conversation'
import { buildSectionItem } from '../buildSectionItem.js'
import { DocumentSectionRouteId } from '../../SectionPromptProvider.js'
import type { ModelRoute, ModelRouteId, RouteNode } from '@gyomu/ai'
import type { SectionPromptProvider } from '../../SectionPromptProvider.js'

const generateText = vi.fn()

const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateText,
} as any)

const modelRoute = {
  nodes: [{ retry: 1, registry: { fast: {} } } as any as RouteNode],
} as ModelRoute
const mockModelRoutes = Layer.succeed(
  ModelRoutes,
  new Map<ModelRouteId, ModelRoute>([[DocumentSectionRouteId, modelRoute]]),
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

    const provider: SectionPromptProvider<'dependencies' | 'compatibility', any> = {
      render: (sectionId, context) => {
        return Effect.succeed([{ id: 'a', role: MessageRole.user, content: 'test' }])
      },
    }
    const program = buildSectionItem('dependencies', context, provider, retryOption)

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
        Effect.provide(mockAiModelService),
      ),
    )

    expect(result).toBe('Hello1')

    expect(generateText).toHaveBeenCalledTimes(1)
  })
})
