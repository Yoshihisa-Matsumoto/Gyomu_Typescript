import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Exit, Layer } from 'effect'
import { executePackageConcept } from '@gyomu/ai-compiler/package-concept'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import { PlatformLayer } from '@gyomu/infra'
import { IOError, getFailureFromExit } from '@gyomu/schema'
import { DocumentSectionRouteId } from '@gyomu/ai-compiler/document'
import { generatePackageConcept } from '../generatePackageConcept.js'
import { ConceptError } from '../../../error/ConceptError.js'

import type { PackageAnalysis } from '@gyomu/schema/concept'
import type { PackageConcept } from '@gyomu/schema/schemas/concept'

vi.mock(import('@gyomu/ai-compiler/package-concept'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    executePackageConcept: vi.fn(),
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
const mockModelRoutes = Layer.succeed(ModelRoutes, new Map([[DocumentSectionRouteId, modelRoute]]))

describe('generatePackageConcept', () => {
  const context = { package: { name: 'test' } } as PackageAnalysis
  const concept = {} as PackageConcept

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns generated directory concept', async () => {
    vi.mocked(executePackageConcept).mockReturnValue(Effect.succeed(concept))

    const result = await Effect.runPromise(
      generatePackageConcept(context).pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
      ),
    )

    expect(result).toBe(concept)

    expect(executePackageConcept).toHaveBeenCalledWith(context, undefined)
  })

  it('passes retry option', async () => {
    const retryOption = {
      maxAttempts: 3,
    } as any

    vi.mocked(executePackageConcept).mockReturnValue(Effect.succeed(concept))

    await Effect.runPromise(
      generatePackageConcept(context, {
        retryOption,
      }).pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
      ),
    )

    expect(executePackageConcept).toHaveBeenCalledWith(context, retryOption)
  })

  it('wraps errors with ConceptError', async () => {
    vi.mocked(executePackageConcept).mockReturnValue(
      Effect.fail(
        new IOError({ cause: undefined, layer: 'filesystem', message: 'boom', operation: 'read' }),
      ),
    )

    const exit = await Effect.runPromiseExit(
      generatePackageConcept(context).pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
      ),
    )

    expect(Exit.isFailure(exit)).toBe(true)

    if (Exit.isFailure(exit)) {
      console.dir(exit, { depth: null })
      const error = getFailureFromExit(exit)

      expect(error).toBeInstanceOf(ConceptError)
      expect(error.message).toBe('Fail to generate Package Concept')
      expect(error.phase).toBe('package-concept')
      expect(error.details).toBe(context)
    }
  })
})
