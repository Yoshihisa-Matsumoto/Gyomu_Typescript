import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer, Schema } from 'effect'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import { PlatformLayer } from '@gyomu/infra'
import { MessageRole } from '@gyomu/schema/conversation'
import { DocumentSectionRouteId } from '../../SectionPromptProvider.js'
import { buildSectionObject } from '../buildSectionObject.js'
import type { ModelRoute, ModelRouteId, RouteNode } from '@gyomu/ai'
import type { SectionPromptProvider } from '../../SectionPromptProvider.js'

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
const TestSchema = Schema.Struct({ text: Schema.String })
describe('buildSectionItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    generateObject.mockReturnValue(
      Effect.succeed({
        object: {
          text: 'Hello1',
        },
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
    const program = buildSectionObject('dependencies', context, provider, TestSchema, retryOption)

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
        Effect.provide(mockAiModelService),
      ),
    )

    expect(result).toMatchObject({
      text: 'Hello1',
    })

    expect(generateObject).toHaveBeenCalledTimes(1)
  })
})
