import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Exit, Layer } from 'effect'
import {
  DirectoryConceptRouteId,
  executeDirectoryConcepts,
} from '@gyomu/ai-compiler/directory-concept'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import { PlatformLayer } from '@gyomu/infra'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { IOError, getFailureFromExit } from '@gyomu/schema'
import { generateDirectoryConcept } from '../generateDirectoryConcept.js'
import { ConceptError } from '../../../error/ConceptError.js'

import type { DirectoryConceptInput } from '@gyomu/schema/concept'
import type { DirectoryConcept } from '@gyomu/schema/schemas/concept'

vi.mock(import('@gyomu/ai-compiler/directory-concept'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    executeDirectoryConcepts: vi.fn(),
  }
})

const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject: () =>
    Effect.succeed({
      object: {},
    }),
} as any)

const modelRoute = {
  nodes: [{ retry: 1, registry: { fast: {} } } as any],
} as any
const mockModelRoutes = Layer.succeed(ModelRoutes, new Map([[DirectoryConceptRouteId, modelRoute]]))

describe('generateDirectoryConcept', () => {
  const targetDirectory = ProjectRelativePath('src')

  const context = {} as DirectoryConceptInput
  const concept = {} as DirectoryConcept

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns generated directory concept', async () => {
    vi.mocked(executeDirectoryConcepts).mockReturnValue(Effect.succeed(concept))

    const result = await Effect.runPromise(
      generateDirectoryConcept('test', targetDirectory, context).pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
      ),
    )

    expect(result).toBe(concept)

    expect(executeDirectoryConcepts).toHaveBeenCalledWith(context, undefined)
  })

  it('passes retry option', async () => {
    const retryOption = {
      maxAttempts: 3,
    } as any

    vi.mocked(executeDirectoryConcepts).mockReturnValue(Effect.succeed(concept))

    await Effect.runPromise(
      generateDirectoryConcept('test', targetDirectory, context, {
        retryOption,
      }).pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
      ),
    )

    expect(executeDirectoryConcepts).toHaveBeenCalledWith(context, retryOption)
  })

  it('wraps errors with ConceptError', async () => {
    vi.mocked(executeDirectoryConcepts).mockReturnValue(
      Effect.fail(
        new IOError({ cause: undefined, layer: 'filesystem', message: 'boom', operation: 'read' }),
      ),
    )

    const exit = await Effect.runPromiseExit(
      generateDirectoryConcept('test', targetDirectory, context).pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
      ),
    )

    expect(Exit.isFailure(exit)).toBe(true)

    if (Exit.isFailure(exit)) {
      const error = getFailureFromExit(exit)

      expect(error).toBeInstanceOf(ConceptError)
      expect(error.filePath).toBe(targetDirectory)
      expect(error.message).toBe('Fail to generate Directory Concept')
      expect(error.phase).toBe('directory-summary')
      expect(error.details).toBe(context)
    }
  })
})
