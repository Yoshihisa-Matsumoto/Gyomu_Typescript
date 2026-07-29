import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import { FileSearchServiceLayer, readYamlFromFileAndValidate } from '@gyomu/infra/fs'
import { makeRunner } from '@gyomu/schema/effect'
import { PlatformLayer } from '@gyomu/infra'
import { IOError } from '@gyomu/schema'
import { buildPackageAnalysis } from '../../package/buildPackageAnalysis.js'
import { loadPackageConcept } from '../../package/internal/loadPackageConcept.js'
import { initializeDocumentBaseContext } from '../initializeDocumentBaseContext.js'

vi.mock('../../package/buildPackageAnalysis.js', () => ({
  buildPackageAnalysis: vi.fn(),
}))

vi.mock('../../package/internal/loadPackageConcept.js', () => ({
  loadPackageConcept: vi.fn(),
}))

vi.mock('@gyomu/infra/fs', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@gyomu/infra/fs')>()

  return {
    ...actual,
    readYamlFromFileAndValidate: vi.fn(),
  }
})

const runner = makeRunner(Layer.provideMerge(PlatformLayer, FileSearchServiceLayer))

describe('initializeDocumentBaseContext', () => {
  const projectContext = {
    projectName: 'test-project',
    projectRoot: 'somewhere',
  } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds readme build context', async () => {
    vi.mocked(buildPackageAnalysis).mockReturnValue(
      Effect.succeed({
        package: {
          name: 'test-package',
        },
      } as any),
    )

    vi.mocked(loadPackageConcept).mockReturnValue(
      Effect.succeed({
        summary: 'test concept',
        capabilities: [],
      } as any),
    )

    vi.mocked(readYamlFromFileAndValidate).mockReturnValueOnce(
      Effect.succeed({
        name: 'test',
      } as any),
    )

    const result = await runner(initializeDocumentBaseContext(projectContext))

    expect(result).toEqual({
      context: {
        analysis: {
          package: {
            name: 'test-package',
          },
        },
        concept: {
          summary: 'test concept',
          capabilities: [],
        },
        knowledge: {
          package: {
            name: 'test',
          },
        },
      },
      knowledgePath: join('somewhere', '.gyomu', 'knowledge'),
    })
  })

  it('fails when package concept does not exist', async () => {
    vi.mocked(buildPackageAnalysis).mockReturnValue(Effect.succeed({} as any))

    vi.mocked(loadPackageConcept).mockReturnValue(Effect.succeed(undefined))

    await expect(runner(initializeDocumentBaseContext(projectContext))).rejects.toThrow(
      'Package Concept not found',
    )
  })

  it('fails when required yaml loading fails', async () => {
    vi.mocked(buildPackageAnalysis).mockReturnValue(Effect.succeed({} as any))

    vi.mocked(loadPackageConcept).mockReturnValue(Effect.succeed({} as any))

    vi.mocked(readYamlFromFileAndValidate).mockReturnValue(
      Effect.fail(
        new IOError({
          cause: undefined,
          message: 'fail',
          layer: 'filesystem',
          operation: 'read',
        }),
      ),
    )

    await expect(runner(initializeDocumentBaseContext(projectContext))).rejects.toThrow()
  })
})
