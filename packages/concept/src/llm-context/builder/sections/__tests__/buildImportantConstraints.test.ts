import { describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { DocumentSectionRouteId, buildSectionItem } from '@gyomu/ai-compiler/document'
import { createMockAiLayer } from '@gyomu/ai'
import { makeRunner, makeRunnerAsReturn } from '@gyomu/schema/effect'
import { AiError } from '@gyomu/schema'
import { LlmContextPromptProvider } from '@gyomu/ai-compiler/llm-context'
import { buildImportantConstraints } from '../buildImportantConstraints.js'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'
import type { ConceptOptions } from '../../../../ConceptOptions.js'

vi.mock('@gyomu/ai-compiler/document', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@gyomu/ai-compiler/document')>()

  return {
    ...actual,
    buildSectionItem: vi.fn(),
  }
})

const mockedBuildSectionItem = vi.mocked(buildSectionItem)

const runQAWithEnvOrThrow = makeRunner(createMockAiLayer(DocumentSectionRouteId))
const runQAWithEnvOrThrowExit = makeRunnerAsReturn(createMockAiLayer(DocumentSectionRouteId))

describe('buildImportantConstraints', () => {
  const createContext = (): LlmContextBuildContext =>
    ({
      analysis: {
        package: {
          name: '@gyomu/concept',
        },
      },
    }) as LlmContextBuildContext

  it('has the expected section builder configuration', () => {
    expect(buildImportantConstraints.id).toBe('important-constraints')
    expect(buildImportantConstraints.enabled(createContext as any)).toBe(true)
  })

  it('builds an important-constraints section', async () => {
    const constraints = [
      'Do not couple Concept generation with Markdown rendering.',
      'Do not depend on editor-specific features.',
    ].join('\n')

    mockedBuildSectionItem.mockReturnValue(Effect.succeed(constraints))

    const context = createContext()

    const result = await runQAWithEnvOrThrow(buildImportantConstraints.build(context))

    expect(result).toEqual({
      section: {
        id: 'important-constraints',
        title: undefined,
        contents: [
          {
            type: 'paragraph',
            text: constraints,
          },
        ],
      },
    })
  })

  it('calls buildSectionItem with the expected arguments', async () => {
    mockedBuildSectionItem.mockReturnValue(Effect.succeed('Important constraints'))

    const context = createContext()

    await runQAWithEnvOrThrow(buildImportantConstraints.build(context))

    expect(mockedBuildSectionItem).toHaveBeenCalledWith(
      'important-constraints',
      context,
      LlmContextPromptProvider,
      undefined,
    )
  })

  it('passes retry option to buildSectionItem', async () => {
    mockedBuildSectionItem.mockReturnValue(Effect.succeed('Important constraints'))

    const retryOption = {
      maxRetries: 3,
    } as ConceptOptions['retryOption']

    const option = {
      retryOption,
    } as ConceptOptions

    const context = createContext()

    await runQAWithEnvOrThrow(buildImportantConstraints.build(context, option))

    expect(mockedBuildSectionItem).toHaveBeenCalledWith(
      'important-constraints',
      context,
      LlmContextPromptProvider,
      retryOption,
    )
  })

  it('wraps buildSectionItem errors as DocumentBuilderError', async () => {
    const cause = new AiError({
      message: 'LLM generation failed',
      cause: undefined,
      model: 'fast',
      operation: 'generate',
      phase: 'request' as const,
      resolution: { _tag: 'fail' },
    })

    mockedBuildSectionItem.mockReturnValue(Effect.fail(cause))

    const context = createContext()

    const result = await runQAWithEnvOrThrowExit(buildImportantConstraints.build(context))

    expect(result._tag).toBe('Failure')

    if (result._tag !== 'Failure') return

    const error = result.failure

    expect(error).toBeDefined()
  })
})
