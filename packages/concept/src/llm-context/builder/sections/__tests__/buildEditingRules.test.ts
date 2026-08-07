import { describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { BulletList } from '@gyomu/schema/schemas/document'
import { DocumentSectionRouteId, buildSectionObject } from '@gyomu/ai-compiler/document'
import { createMockAiLayer } from '@gyomu/ai'
import { makeRunner, makeRunnerAsReturn } from '@gyomu/schema/effect'
import { AiError } from '@gyomu/schema'
import { LlmContextPromptProvider } from '@gyomu/ai-compiler/llm-context'
import { buildEditingRules } from '../buildEditingRules.js'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'
import type { ConceptOptions } from '../../../../ConceptOptions.js'

vi.mock('@gyomu/ai-compiler/document', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@gyomu/ai-compiler/document')>()

  return {
    ...actual,
    buildSectionObject: vi.fn(),
  }
})

const mockedBuildSectionObject = vi.mocked(buildSectionObject)

const runQAWithEnvOrThrow = makeRunner(createMockAiLayer(DocumentSectionRouteId))
const runQAWithEnvOrThrowExit = makeRunnerAsReturn(createMockAiLayer(DocumentSectionRouteId))

describe('buildEditingRules', () => {
  const createContext = (): LlmContextBuildContext =>
    ({
      analysis: {
        package: {
          name: '@gyomu/concept',
        },
      },
    }) as LlmContextBuildContext

  it('has the expected section builder configuration', () => {
    expect(buildEditingRules.id).toBe('editing-rules')
    expect(buildEditingRules.enabled(createContext as any)).toBe(true)
  })

  it('builds an editing-rules section', async () => {
    const sectionObject = {
      type: 'bullet-list',
      items: [
        'Follow the repository coding guidelines.',
        'Do not introduce circular dependencies.',
      ],
    }

    mockedBuildSectionObject.mockReturnValue(Effect.succeed(sectionObject))

    const context = createContext()

    const result = await runQAWithEnvOrThrow(buildEditingRules.build(context))

    expect(result).toEqual({
      section: {
        id: 'editing-rules',
        title: undefined,
        contents: [sectionObject],
      },
    })
  })

  it('calls buildSectionObject with the expected arguments', async () => {
    const sectionObject = {
      type: 'bullet-list',
      items: ['Editing rule'],
    }

    mockedBuildSectionObject.mockReturnValue(Effect.succeed(sectionObject))

    const context = createContext()

    await runQAWithEnvOrThrow(buildEditingRules.build(context))

    expect(mockedBuildSectionObject).toHaveBeenCalledWith(
      'editing-rules',
      context,
      LlmContextPromptProvider,
      BulletList,
      undefined,
    )
  })

  it('passes retry option to buildSectionObject', async () => {
    const sectionObject = {
      type: 'bullet-list',
      items: ['Editing rule'],
    }

    mockedBuildSectionObject.mockReturnValue(Effect.succeed(sectionObject))

    const retryOption = {
      maxRetries: 3,
    } as ConceptOptions['retryOption']

    const option = {
      retryOption,
    } as ConceptOptions

    const context = createContext()

    await runQAWithEnvOrThrow(buildEditingRules.build(context, option))

    expect(mockedBuildSectionObject).toHaveBeenCalledWith(
      'editing-rules',
      context,
      expect.anything(),
      BulletList,
      retryOption,
    )
  })

  it('wraps buildSectionObject errors as DocumentBuilderError', async () => {
    const cause = new AiError({
      message: 'LLM generation failed',
      cause: undefined,
      model: 'fast',
      operation: 'generate',
      phase: 'request' as const,
      resolution: { _tag: 'fail' },
    })

    mockedBuildSectionObject.mockReturnValue(Effect.fail(cause))

    const context = createContext()

    const result = await runQAWithEnvOrThrowExit(buildEditingRules.build(context))

    expect(result._tag).toBe('Failure')

    if (result._tag !== 'Failure') return

    const error = result.failure

    expect(error).toBeDefined()
  })
})
