import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import { FileSearchServiceLayer, readYamlFromFileAndValidate } from '@gyomu/infra/fs'
import { makeRunner } from '@gyomu/schema/effect'
import { PlatformLayer } from '@gyomu/infra'
import { IOError } from '@gyomu/schema'
import { initializeLlmContextBuildContext } from '../initializeLlmContextBuildContext.js'
import { initializeDocumentBaseContext } from '../../document/initializeDocumentBaseContext.js'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'

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

  it('builds llm contexts build context', async () => {
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
        },
        knowledgePath: '',
      } as any),
    )

    vi.mocked(readYamlFromFileAndValidate)
      .mockReturnValueOnce(
        Effect.succeed({
          displayName: 'ABC',
          rules: [],
          principles: [],
          forbidden: [],
        } as any),
      )
      .mockReturnValueOnce(
        Effect.succeed({
          displayName: 'ABC',
          rules: [],
          principles: [],
          forbidden: [],
        } as any),
      )

    const result: LlmContextBuildContext = await runner(
      initializeLlmContextBuildContext(projectContext),
    )

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
        codingGuideline: {
          displayName: 'ABC',
          rules: [],
          forbidden: [],
          principles: [],
        },
      },
    })
  })
  it('correctly merge coding guideline', async () => {
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
        },
        knowledgePath: '',
      } as any),
    )

    vi.mocked(readYamlFromFileAndValidate)
      .mockReturnValueOnce(
        Effect.succeed({
          displayName: 'Root',
          rules: ['RootA', 'RootB'],
          principles: ['RootA', 'RootB'],
          forbidden: ['RootA', 'RootB'],
        } as any),
      )
      .mockReturnValueOnce(
        Effect.succeed({
          displayName: 'Local',
          rules: ['LocalA', 'LocalB'],
          principles: ['LocalA', 'LocalB'],
          forbidden: ['LocalA', 'LocalB'],
        } as any),
      )

    const result: LlmContextBuildContext = await runner(
      initializeLlmContextBuildContext(projectContext),
    )

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
        codingGuideline: {
          displayName: 'Local',
          rules: ['RootA', 'RootB', 'LocalA', 'LocalB'],
          forbidden: ['RootA', 'RootB', 'LocalA', 'LocalB'],
          principles: ['RootA', 'RootB', 'LocalA', 'LocalB'],
        },
      },
    })
  })
  it('work without local coding guideline', async () => {
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
        },
        knowledgePath: '',
      } as any),
    )

    vi.mocked(readYamlFromFileAndValidate)
      .mockReturnValueOnce(
        Effect.succeed({
          displayName: 'Root',
          rules: ['RootA', 'RootB'],
          principles: ['RootA', 'RootB'],
          forbidden: ['RootA', 'RootB'],
        } as any),
      )
      .mockReturnValue(
        Effect.fail(
          new IOError({
            cause: undefined,
            layer: 'filesystem' as const,
            message: 'fail',
            operation: 'read',
          }),
        ),
      )

    const result: LlmContextBuildContext = await runner(
      initializeLlmContextBuildContext(projectContext),
    )

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
        codingGuideline: {
          displayName: 'Root',
          rules: ['RootA', 'RootB'],
          forbidden: ['RootA', 'RootB'],
          principles: ['RootA', 'RootB'],
        },
      },
    })
  })
  it('fail without root coding guideline', async () => {
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
        },
        knowledgePath: '',
      } as any),
    )

    vi.mocked(readYamlFromFileAndValidate).mockReturnValue(
      Effect.fail(
        new IOError({
          cause: undefined,
          layer: 'filesystem' as const,
          message: 'fail',
          operation: 'read',
        }),
      ),
    )

    await expect(runner(initializeLlmContextBuildContext(projectContext))).rejects.toThrow(
      'Fail to build LLM context',
    )
  })
})
