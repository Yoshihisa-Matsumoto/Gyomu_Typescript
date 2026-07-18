import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import { NodeFileSystem } from '@effect/platform-node'
import { MessageRole } from '@gyomu/schema/conversation'
import { PackageInsightSchema } from '@gyomu/schema/schemas/concept'
import { loadPrompt } from '../../prompt/loadPrompt.js'
import { PackageConceptRouteId, executePackageInsight } from '../executePackageInsight.js'
import type { ModelRoute, ModelRouteId, RouteNode } from '@gyomu/ai'
import type { PackageInsight } from '@gyomu/schema/schemas/concept'

vi.mock('../../prompt/loadPrompt.js', () => ({
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
  new Map<ModelRouteId, ModelRoute>([[PackageConceptRouteId, modelRoute]]),
)

describe('executePackageConcept', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(loadPrompt).mockReturnValue(
      Effect.succeed(`PackageAnalysis:
<##PACKAGE##>`),
    )

    generateObject.mockReturnValue(
      Effect.succeed({
        object: {
          summary: 'summary',
          responsibilities: ['r1'],
          capabilities: [{ name: 'skill', description: 'aaa' }],
          designDecisions: ['design'],
          usageGuidance: ['abc'],
        } satisfies PackageInsight,
      }),
    )
  })

  it('renders the prompt and invokes generateObject', async () => {
    const context = {
      package: 'test',
      exports: [],
      directories: [],
      dependencies: [],
      exportedFiles: [],
    } as any

    const retryOption = {
      maxAttempts: 3,
    } as any

    const result = await Effect.runPromise(
      executePackageInsight(context, retryOption).pipe(
        Effect.provide(NodeFileSystem.layer),
        Effect.provide(mockModelRoutes),
        Effect.provide(mockAiModelService),
      ),
    )

    expect(result.summary).toBe('summary')

    expect(loadPrompt).toHaveBeenCalledWith('package-concept.md')

    expect(generateObject).toHaveBeenCalledTimes(1)

    expect(generateObject).toHaveBeenCalledWith({
      routeId: PackageConceptRouteId,
      key: 'fast',
      messages: [
        {
          id: '1',
          role: MessageRole.user,
          content: `PackageAnalysis:
{
  "packageInfo": "test",
  "publicApi": [],
  "directoryConcepts": [],
  "dependencySummary": [],
  "fileSummary": []
}`,
        },
      ],
      schema: PackageInsightSchema,
      retryOption,
    })
  })
})
