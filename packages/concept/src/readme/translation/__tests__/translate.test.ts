import { describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'

import { executeTranslation } from '@gyomu/ai-compiler/translation'
import { AiModelRoute } from '@gyomu/ai'
import { makeRunner } from '@gyomu/schema/effect'
import { IOError } from '@gyomu/schema'
import { translate } from '../translate.js'
import type { TranslationResult } from '@gyomu/schema/schemas/document'

vi.mock('@gyomu/ai-compiler/translation', () => ({
  executeTranslation: vi.fn(),
}))

const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject: () => Effect.succeed({ object: {} }),
} as any)
const runQAWithEnvOrThrow = makeRunner(mockAiModelService)

describe('translate', () => {
  const context = {
    analysis: {
      package: {
        name: 'test-package',
      },
    },
  } as any

  it('passes translation request to executeTranslation', async () => {
    vi.mocked(executeTranslation).mockReturnValue(
      Effect.succeed([
        {
          id: 'overview.title',
          translation: '概要',
        },
      ] satisfies TranslationResult),
    )

    const targets = [
      {
        id: 'overview.title',
        source: 'Overview',
        location: {
          sectionId: 'overview',
          path: ['title'],
        },
      },
    ]

    await runQAWithEnvOrThrow(translate(context, 'ja', targets))

    expect(executeTranslation).toHaveBeenCalledWith('test-package', {
      targetLanguage: 'ja',
      translations: [
        {
          id: 'overview.title',
          source: 'Overview',
        },
      ],
    })
  })
  it('wraps infra error', async () => {
    vi.mocked(executeTranslation).mockReturnValue(
      Effect.fail(
        new IOError({
          message: 'boom',
          cause: undefined,
          layer: 'filesystem',
          operation: 'read',
        }),
      ),
    )

    await expect(runQAWithEnvOrThrow(translate(context, 'ja', []))).rejects.toMatchObject({
      phase: 'translate',
      packageName: 'test-package',
    })
  })
})
