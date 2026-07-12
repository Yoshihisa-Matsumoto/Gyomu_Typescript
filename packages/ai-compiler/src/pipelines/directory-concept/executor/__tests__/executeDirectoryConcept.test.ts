import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import { NodeFileSystem } from '@effect/platform-node'
import { MessageRole } from '@gyomu/schema/conversation'
import { DirectoryConceptRouteId, executeDirectoryConcepts } from '../executeDirectoryConcept.js'
import { loadPrompt } from '../../prompt/loadPrompt.js'
import { renderFileSummary } from '../../renderer/renderFileSummary.js'
import { renderSubDirectory } from '../../renderer/renderSubDirectory.js'
import { DirectoryConceptSchema } from '../../schema/DirectoryConcept.js'
import type { ModelRoute, ModelRouteId, RouteNode } from '@gyomu/ai'

vi.mock('../../prompt/loadPrompt.js', () => ({
  loadPrompt: vi.fn(),
}))

vi.mock('../../renderer/renderFileSummary.js', () => ({
  renderFileSummary: vi.fn(),
}))

vi.mock('../../renderer/renderSubDirectory.js', () => ({
  renderSubDirectory: vi.fn(),
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
  new Map<ModelRouteId, ModelRoute>([[DirectoryConceptRouteId, modelRoute]]),
)

describe('executeDirectoryConcepts', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(loadPrompt).mockReturnValue(
      Effect.succeed(`FILES
<##FILES##>

DIRS
<##DIRECTORIES##>`),
    )

    vi.mocked(renderFileSummary).mockReturnValue('FILE')

    vi.mocked(renderSubDirectory).mockReturnValue('DIR')

    generateObject.mockReturnValue(
      Effect.succeed({
        object: {
          summary: 'summary',
          responsibilities: ['r1'],
          concepts: ['c1'],
          relationships: ['rel'],
          designDecisions: ['decision'],
        },
      }),
    )
  })

  it('renders the prompt and invokes generateObject', async () => {
    const context = {
      files: [{ path: 'a.ts' }] as any,
      subDirectories: [{ path: 'sub', concept: {} }] as any,
    }

    const retryOption = {
      maxAttempts: 3,
    } as any

    const result = await Effect.runPromise(
      executeDirectoryConcepts(context, retryOption).pipe(
        Effect.provide(NodeFileSystem.layer),
        Effect.provide(mockModelRoutes),
        Effect.provide(mockAiModelService),
      ),
    )

    expect(result.summary).toBe('summary')

    expect(loadPrompt).toHaveBeenCalledWith('directory-concept.md')

    expect(renderFileSummary).toHaveBeenCalledWith(context.files[0])

    expect(renderSubDirectory).toHaveBeenCalledWith(context.subDirectories[0])

    expect(generateObject).toHaveBeenCalledTimes(1)

    expect(generateObject).toHaveBeenCalledWith({
      routeId: DirectoryConceptRouteId,
      key: 'fast',
      messages: [
        {
          id: '1',
          role: MessageRole.user,
          content: `FILES
FILE

DIRS
DIR`,
        },
      ],
      schema: DirectoryConceptSchema,
      retryOption,
    })
  })
})
