import { describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { BulletList } from '@gyomu/schema/schemas/document'
import { DocumentSectionRouteId, buildSectionObject } from '@gyomu/ai-compiler/document'
import { createMockAiLayer } from '@gyomu/ai'
import { makeRunner, makeRunnerAsReturn } from '@gyomu/schema/effect'
import { AiError } from '@gyomu/schema'
import { LlmContextPromptProvider } from '@gyomu/ai-compiler/llm-context'
import { buildDesignPrinciples } from '../buildDesignPrinciples.js'
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

describe('buildDesignPrinciples', () => {
  const createContext = (): LlmContextBuildContext =>
    ({
      analysis: {
        package: {
          name: '@gyomu/concept',
        },
      },
    }) as LlmContextBuildContext

  it('has the expected section builder configuration', () => {
    expect(buildDesignPrinciples.id).toBe('design-principles')
    expect(buildDesignPrinciples.enabled(createContext as any)).toBe(true)
  })

  it('builds a design-principles section', async () => {
    const sectionObject = {
      type: 'bullet-list',
      items: [
        'Keep Concept independent of rendering.',
        'Use Concept as the canonical knowledge model.',
      ],
    }

    mockedBuildSectionObject.mockReturnValue(Effect.succeed(sectionObject))

    const context = createContext()

    const result = await runQAWithEnvOrThrow(buildDesignPrinciples.build(context))

    expect(result).toEqual({
      section: {
        id: 'design-principles',
        title: undefined,
        contents: [sectionObject],
      },
    })
  })

  it('calls buildSectionObject with the expected arguments', async () => {
    const sectionObject = {
      type: 'bullet-list',
      items: ['Design principle'],
    }

    mockedBuildSectionObject.mockReturnValue(Effect.succeed(sectionObject))

    const context = createContext()

    await runQAWithEnvOrThrow(buildDesignPrinciples.build(context))

    expect(mockedBuildSectionObject).toHaveBeenCalledWith(
      'design-principles',
      context,
      LlmContextPromptProvider,
      BulletList,
      undefined,
    )
  })

  it('passes retry option to buildSectionObject', async () => {
    const sectionObject = {
      type: 'bullet-list',
      items: ['Design principle'],
    }

    mockedBuildSectionObject.mockReturnValue(Effect.succeed(sectionObject))

    const retryOption = {
      maxRetries: 3,
    } as ConceptOptions['retryOption']

    const option = {
      retryOption,
    } as ConceptOptions

    const context = createContext()

    await runQAWithEnvOrThrow(buildDesignPrinciples.build(context, option))

    expect(mockedBuildSectionObject).toHaveBeenCalledWith(
      'design-principles',
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

    const result = await runQAWithEnvOrThrowExit(buildDesignPrinciples.build(context))

    expect(result._tag).toBe('Failure')

    if (result._tag !== 'Failure') return

    const error = result.failure

    expect(error).toBeDefined()
  })
})
