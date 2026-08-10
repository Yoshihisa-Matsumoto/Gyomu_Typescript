import { describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { DocumentSectionRouteId } from '@gyomu/ai-compiler/document'
import { createMockAiLayer } from '@gyomu/ai'
import { makeRunner, makeRunnerAsReturn } from '@gyomu/schema/effect'
import { AiError } from '@gyomu/schema'
import { LlmContextPromptProvider } from '@gyomu/ai-compiler/llm-context'
import { buildEditingRules } from '../buildEditingRules.js'
import { buildBulletList } from '../../../../document/builder/buildBulletList.js'
import type { BulletList } from '@gyomu/schema/schemas/document'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'
import type { ConceptOptions } from '../../../../ConceptOptions.js'

vi.mock('../../../../document/builder/buildBulletList.js', () => ({
  buildBulletList: vi.fn(),
}))

const mockedBuildBulletList = vi.mocked(buildBulletList)
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
        { text: 'Follow the repository coding guidelines.', translationId: 1 },
        { text: 'Do not introduce circular dependencies.', translationId: 2 },
      ],
    } satisfies BulletList

    mockedBuildBulletList.mockReturnValue(Effect.succeed(sectionObject))

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
      items: [{ text: 'Editing rule', translationId: 1 }],
    } satisfies BulletList

    mockedBuildBulletList.mockReturnValue(Effect.succeed(sectionObject))

    const context = createContext()

    await runQAWithEnvOrThrow(buildEditingRules.build(context))

    expect(mockedBuildBulletList).toHaveBeenCalledWith(
      'editing-rules',
      context,
      LlmContextPromptProvider,
      undefined,
    )
  })

  it('passes retry option to buildSectionObject', async () => {
    const sectionObject = {
      type: 'bullet-list',
      items: [{ text: 'Editing rule', translationId: 1 }],
    } satisfies BulletList

    mockedBuildBulletList.mockReturnValue(Effect.succeed(sectionObject))

    const retryOption = {
      maxRetries: 3,
    } as ConceptOptions['retryOption']

    const option = {
      retryOption,
    } as ConceptOptions

    const context = createContext()

    await runQAWithEnvOrThrow(buildEditingRules.build(context, option))

    expect(mockedBuildBulletList).toHaveBeenCalledWith(
      'editing-rules',
      context,
      expect.anything(),
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

    mockedBuildBulletList.mockReturnValue(Effect.fail(cause))

    const context = createContext()

    const result = await runQAWithEnvOrThrowExit(buildEditingRules.build(context))

    expect(result._tag).toBe('Failure')

    if (result._tag !== 'Failure') return

    const error = result.failure

    expect(error).toBeDefined()
  })
})
