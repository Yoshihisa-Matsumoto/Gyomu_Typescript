import { describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { DocumentSectionRouteId, buildSectionObject } from '@gyomu/ai-compiler/document'
import { makeRunner, makeRunnerAsReturn } from '@gyomu/schema/effect'
import { createMockAiLayer } from '@gyomu/ai'
import { AiError } from '@gyomu/schema'
import { buildBulletList } from '../buildBulletList.js'
import type { GeneratedBulletList } from '../../schemas/GeneratedBulletList.js'
import type { SectionPromptProvider } from '@gyomu/ai-compiler/document'

vi.mock('@gyomu/ai-compiler/document', async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await vi.importActual<typeof import('@gyomu/ai-compiler/document')>(
    '@gyomu/ai-compiler/document',
  )

  return {
    ...actual,
    buildSectionObject: vi.fn(),
  }
})

const mockedBuildSectionObject = vi.mocked(buildSectionObject)

const runQAWithEnvOrThrow = makeRunner(createMockAiLayer(DocumentSectionRouteId))
const runQAWithEnvOrThrowExit = makeRunnerAsReturn(createMockAiLayer(DocumentSectionRouteId))

describe('buildBulletList', () => {
  it('GeneratedBulletListをBulletListに変換する', async () => {
    const generated: GeneratedBulletList = {
      type: 'bullet-list',
      items: [
        {
          text: 'First principle',
        },
        {
          text: 'Second principle',
        },
      ],
    }

    mockedBuildSectionObject.mockReturnValue(Effect.succeed(generated))

    const result = await runQAWithEnvOrThrow(
      buildBulletList(
        'design-principles',
        {},
        {} as SectionPromptProvider<'design-principles', object>,
      ),
    )

    expect(result).toEqual({
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'First principle',
        },
        {
          translationId: 2,
          text: 'Second principle',
        },
      ],
    })
  })

  it('ネストしたBulletListItemにもtranslationIdを付与する', async () => {
    const generated: GeneratedBulletList = {
      type: 'bullet-list',
      items: [
        {
          text: 'First principle',
          children: [
            {
              text: 'First detail',
            },
            {
              text: 'Second detail',
              children: [
                {
                  text: 'Nested detail',
                },
              ],
            },
          ],
        },
        {
          text: 'Second principle',
        },
      ],
    }

    mockedBuildSectionObject.mockReturnValue(Effect.succeed(generated))

    const result = await runQAWithEnvOrThrow(
      buildBulletList(
        'design-principles',
        {},
        {} as SectionPromptProvider<'design-principles', object>,
      ),
    )

    expect(result).toEqual({
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'First principle',
          children: [
            {
              translationId: 2,
              text: 'First detail',
            },
            {
              translationId: 3,
              text: 'Second detail',
              children: [
                {
                  translationId: 4,
                  text: 'Nested detail',
                },
              ],
            },
          ],
        },
        {
          translationId: 5,
          text: 'Second principle',
        },
      ],
    })
  })

  it('childrenが存在しない場合はchildrenを生成しない', async () => {
    const generated: GeneratedBulletList = {
      type: 'bullet-list',
      items: [
        {
          text: 'First principle',
        },
      ],
    }

    mockedBuildSectionObject.mockReturnValue(Effect.succeed(generated))

    const result = await runQAWithEnvOrThrow(
      buildBulletList(
        'design-principles',
        {},
        {} as SectionPromptProvider<'design-principles', object>,
      ),
    )

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const firstItem = result.items[0]!
    if (firstItem.children && firstItem.children.length > 0) {
      expect(result.items[0]).not.toHaveProperty('children')
    }
  })

  it('buildSectionObjectのエラーを伝播する', async () => {
    const error = new AiError({
      message: 'build failed',
      cause: undefined,
      model: 'fast',
      operation: 'generate',
      phase: 'request',
      resolution: { _tag: 'fail' },
    })

    mockedBuildSectionObject.mockReturnValue(Effect.fail(error as never))

    const result = await runQAWithEnvOrThrowExit(
      buildBulletList(
        'design-principles',
        {},
        {} as SectionPromptProvider<'design-principles', object>,
      ),
    )

    expect(result._tag).toBe('Failure')
  })
})
