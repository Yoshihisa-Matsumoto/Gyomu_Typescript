import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer, Result } from 'effect'

import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { AiModelRoute } from '@gyomu/ai'
import { makeRunner, makeRunnerAsReturn } from '@gyomu/schema/effect'
import { FileSearchServiceLayer } from '@gyomu/infra/fs'
import { buildPackageConcept } from '../buildPackageConcept.js'
import { loadPackageConcept } from '../internal/loadPackageConcept.js'
import { buildPackageAnalysis } from '../buildPackageAnalysis.js'
import { generatePackageConcept } from '../internal/generatePackageConcept.js'
import { savePackageConcept } from '../internal/savePackageConcept.js'
import type { PackageConcept } from '@gyomu/schema/schemas/concept'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(
  Layer.provideMerge(PlatformLayer),
  Layer.provideMerge(FileSearchServiceLayer),
)
const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject: () => Effect.succeed({ object: {} }),
} as any)
const runQAWithEnvOrThrow = makeRunner(mockAiModelService)
const runQAWithResult = makeRunnerAsReturn(mockAiModelService)

vi.mock('../internal/loadPackageConcept.js')
vi.mock('../buildPackageAnalysis.js')
vi.mock('../internal/generatePackageConcept.js')
vi.mock('../internal/savePackageConcept.js')

describe('buildPackageConcept', () => {
  const context = {} as any

  const packageAnalysis = {
    responsibilities: [],
    capabilities: [],
    relationships: [],
    designDecisions: [],
    publicApi: [],
    dependencies: [],
    package: { name: '@gyomu/test', private: false, type: 'module', version: '1.0.0' },
    exportedFiles: [],
  } as any

  const packageConcept = {
    responsibilities: [],
    capabilities: [],
    relationships: [],
    designDecisions: [],
    summary: '',
    usageGuidance: [],
  } as PackageConcept

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds package concept when changedFiles is not specified', async () => {
    vi.mocked(buildPackageAnalysis).mockReturnValue(Effect.succeed(packageAnalysis))
    vi.mocked(generatePackageConcept).mockReturnValue(Effect.succeed(packageConcept))
    vi.mocked(savePackageConcept).mockReturnValue(Effect.void)

    const result = await runQAWithEnvOrThrow(buildPackageConcept(context), layer)

    expect(result).toMatchObject(packageConcept)

    expect(loadPackageConcept).not.toHaveBeenCalled()
    expect(buildPackageAnalysis).toHaveBeenCalledOnce()
    expect(generatePackageConcept).toHaveBeenCalledOnce()
    expect(savePackageConcept).toHaveBeenCalledOnce()
  })

  it('returns cached package concept when found', async () => {
    vi.mocked(loadPackageConcept).mockReturnValue(Effect.succeed(packageConcept))

    const result = await runQAWithEnvOrThrow(
      buildPackageConcept(context, { changedFiles: [] }),
      layer,
    )

    expect(result).toBe(packageConcept)

    expect(loadPackageConcept).toHaveBeenCalledOnce()
    expect(buildPackageAnalysis).not.toHaveBeenCalled()
    expect(generatePackageConcept).not.toHaveBeenCalled()
    expect(savePackageConcept).not.toHaveBeenCalled()
  })

  it('rebuilds when cached package concept is undefined', async () => {
    vi.mocked(loadPackageConcept).mockReturnValue(Effect.succeed(undefined))
    vi.mocked(buildPackageAnalysis).mockReturnValue(Effect.succeed(packageAnalysis))
    vi.mocked(generatePackageConcept).mockReturnValue(Effect.succeed(packageConcept))
    vi.mocked(savePackageConcept).mockReturnValue(Effect.void)

    const result = await runQAWithEnvOrThrow(
      buildPackageConcept(context, { changedFiles: [] }),
      layer,
    )
    console.dir(result, { depth: null })
    expect(result).toMatchObject(packageConcept)

    expect(loadPackageConcept).toHaveBeenCalledOnce()
    expect(buildPackageAnalysis).toHaveBeenCalledOnce()
    expect(generatePackageConcept).toHaveBeenCalledOnce()
    expect(savePackageConcept).toHaveBeenCalledOnce()
  })

  it('rebuilds when loading cached package concept fails', async () => {
    vi.mocked(loadPackageConcept).mockReturnValue(Effect.fail({} as any))
    vi.mocked(buildPackageAnalysis).mockReturnValue(Effect.succeed(packageAnalysis))
    vi.mocked(generatePackageConcept).mockReturnValue(Effect.succeed(packageConcept))
    vi.mocked(savePackageConcept).mockReturnValue(Effect.void)

    const result = await runQAWithEnvOrThrow(
      buildPackageConcept(context, { changedFiles: [] }),
      layer,
    )

    expect(result).toMatchObject(packageConcept)

    expect(loadPackageConcept).toHaveBeenCalledOnce()
    expect(buildPackageAnalysis).toHaveBeenCalledOnce()
    expect(generatePackageConcept).toHaveBeenCalledOnce()
    expect(savePackageConcept).toHaveBeenCalledOnce()
  })

  it('fails when buildPackageAnalysis fails', async () => {
    const error = {} as any

    vi.mocked(buildPackageAnalysis).mockReturnValue(Effect.fail(error))

    const exit = await runQAWithResult(buildPackageConcept(context), layer)

    expect(Result.isFailure(exit)).toBe(true)

    expect(generatePackageConcept).not.toHaveBeenCalled()
    expect(savePackageConcept).not.toHaveBeenCalled()
  })

  it('fails when generatePackageConcept fails', async () => {
    const error = {} as any

    vi.mocked(buildPackageAnalysis).mockReturnValue(Effect.succeed(packageAnalysis))
    vi.mocked(generatePackageConcept).mockReturnValue(Effect.fail(error))

    const exit = await runQAWithResult(buildPackageConcept(context), layer)

    expect(Result.isFailure(exit)).toBe(true)

    expect(savePackageConcept).not.toHaveBeenCalled()
  })

  it('fails when savePackageConcept fails', async () => {
    const error = {} as any

    vi.mocked(buildPackageAnalysis).mockReturnValue(Effect.succeed(packageAnalysis))
    vi.mocked(generatePackageConcept).mockReturnValue(Effect.succeed(packageConcept))
    vi.mocked(savePackageConcept).mockReturnValue(Effect.fail(error))

    const exit = await runQAWithResult(buildPackageConcept(context), layer)

    expect(Result.isFailure(exit)).toBe(true)
  })
})
