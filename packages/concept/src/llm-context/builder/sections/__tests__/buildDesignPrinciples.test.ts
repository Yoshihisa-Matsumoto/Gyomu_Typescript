import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { makeRunner, makeRunnerAsReturn } from '@gyomu/schema/effect'
import { createMockAiLayer } from '@gyomu/ai'
import { DocumentSectionRouteId } from '@gyomu/ai-compiler/document'
import { buildBulletList } from '../../../../document/builder/buildBulletList.js'
import { buildDesignPrinciples } from '../buildDesignPrinciples.js'
import type { BulletList } from '@gyomu/schema/schemas/document'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'
import type { ConceptOptions } from '../../../../ConceptOptions.js'

vi.mock('../../../../document/builder/buildBulletList.js', () => ({
  buildBulletList: vi.fn(),
}))

const mockedBuildBulletList = vi.mocked(buildBulletList)
const runQAWithEnvOrThrow = makeRunner(createMockAiLayer(DocumentSectionRouteId))
const runQAWithEnvOrThrowExit = makeRunnerAsReturn(createMockAiLayer(DocumentSectionRouteId))

describe('buildDesignPrinciples', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const context = {
    analysis: {
      package: {
        name: '@gyomu/schema',
      },
    },
  } as LlmContextBuildContext

  const bulletList: BulletList = {
    type: 'bullet-list',
    items: [
      {
        translationId: 1,
        text: 'Use Effect Schema for shared data.',
      },
      {
        translationId: 2,
        text: 'Keep dependencies isolated.',
      },
    ],
  }

  it('design-principles sectionを生成する', async () => {
    mockedBuildBulletList.mockReturnValue(Effect.succeed(bulletList))

    const result = await runQAWithEnvOrThrow(buildDesignPrinciples.build(context))

    expect(result).toEqual({
      section: {
        id: 'design-principles',
        title: undefined,
        contents: [bulletList],
      },
    })

    expect(mockedBuildBulletList).toHaveBeenCalledOnce()
    expect(mockedBuildBulletList).toHaveBeenCalledWith(
      'design-principles',
      context,
      expect.anything(),
      undefined,
    )
  })

  it('retryOptionをbuildBulletListに渡す', async () => {
    mockedBuildBulletList.mockReturnValue(Effect.succeed(bulletList))

    const retryOption = {
      maxRetries: 3,
    } as ConceptOptions['retryOption']

    const option: ConceptOptions = {
      retryOption,
    }

    await runQAWithEnvOrThrow(buildDesignPrinciples.build(context, option))

    expect(mockedBuildBulletList).toHaveBeenCalledWith(
      'design-principles',
      context,
      expect.anything(),
      retryOption,
    )
  })

  it('buildBulletListのエラーをDocumentBuilderErrorにラップする', async () => {
    const cause = new Error('build bullet list failed')

    mockedBuildBulletList.mockReturnValue(Effect.fail(cause as never))

    const result = await runQAWithEnvOrThrowExit(buildDesignPrinciples.build(context))

    expect(result._tag).toBe('Failure')

    if (result._tag === 'Failure') {
      const error = result.failure

      {
        expect(error).toMatchObject({
          filePath: 'Concept.md',
          packageName: '@gyomu/schema',
          phase: 'section-build',
          sectionId: 'design-principles',
          cause,
        })
      }
    }
  })

  it('translation strategyはnoneである', () => {
    expect(buildDesignPrinciples.translation).toEqual({
      strategy: 'none',
    })
  })

  it('enabledはtrueを返す', () => {
    expect(buildDesignPrinciples.enabled(context)).toBe(true)
  })
})
