import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import { FileSearchServiceLayer, readYamlFromFileAndValidate } from '@gyomu/infra/fs'
import { makeRunner } from '@gyomu/schema/effect'
import { PlatformLayer } from '@gyomu/infra'
import { IOError } from '@gyomu/schema'
import { initializeReadmeBuildContext } from '../initializeReadmeBuildContext.js'
import { initializeDocumentBaseContext } from '../../document/initializeDocumentBaseContext.js'

vi.mock('../../document/initializeDocumentBaseContext.js', () => ({
  initializeDocumentBaseContext: vi.fn(),
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

describe('initializeReadmeBuildContext', () => {
  const projectContext = {
    projectName: 'test-project',
    projectRoot: 'src',
  } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds readme build context', async () => {
    vi.mocked(initializeDocumentBaseContext).mockReturnValue(
      Effect.succeed({
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
        knowledgePath: '',
      } as any),
    )
    vi.mocked(readYamlFromFileAndValidate)
      .mockReturnValueOnce(
        Effect.succeed({
          scripts: [],
        } as any),
      )
      .mockReturnValueOnce(
        Effect.succeed({
          dependencies: [],
        } as any),
      )
      .mockReturnValueOnce(
        Effect.succeed({
          items: [],
        } as any),
      )

    const result = await runner(initializeReadmeBuildContext(projectContext))

    expect(result).toEqual({
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
        development: {
          scripts: [],
        },
        technical: {
          dependencies: [],
        },
        roadmap: {
          items: [],
        },
      },
    })
  })

  it('allows missing roadmap', async () => {
    vi.mocked(initializeDocumentBaseContext).mockReturnValue(
      Effect.succeed({
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
        knowledgePath: '',
      } as any),
    )
    vi.mocked(readYamlFromFileAndValidate)
      .mockReturnValueOnce(Effect.succeed({} as any))
      .mockReturnValueOnce(Effect.succeed({} as any))
      .mockReturnValueOnce(
        Effect.fail(
          new IOError({
            cause: undefined,
            message: 'fail',
            layer: 'filesystem',
            operation: 'read',
          }),
        ),
      )

    const result = await runner(initializeReadmeBuildContext(projectContext))

    expect(result.knowledge.roadmap).toBeUndefined()
  })

  it('fails when required yaml loading fails', async () => {
    vi.mocked(initializeDocumentBaseContext).mockReturnValue(
      Effect.succeed({
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
        knowledgePath: '',
      } as any),
    )

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

    await expect(runner(initializeReadmeBuildContext(projectContext))).rejects.toThrow()
  })
})
