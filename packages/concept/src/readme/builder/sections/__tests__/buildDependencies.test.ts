import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import { buildSectionItem } from '@gyomu/ai-compiler/document'
import { PlatformLayer } from '@gyomu/infra'
import { AiModelRoute } from '@gyomu/ai'
import { makeRunner } from '@gyomu/schema/effect'
import { AiError } from '@gyomu/schema'
import { ReadmePromptProvider } from '@gyomu/ai-compiler/readme'
import { DocumentBuilderError } from '../../../../error/DocumentBuilderError.js'
import { buildDependencies } from '../buildDependencies.js'

vi.mock('@gyomu/ai-compiler/document', () => ({
  buildSectionItem: vi.fn(),
}))

const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject: () => Effect.succeed({ object: {} }),
} as any)
const runQAWithEnvOrThrow = makeRunner(mockAiModelService)
describe('buildDependencies', () => {
  const context = {
    analysis: {
      package: {
        name: 'test-package',
      },
    },
  } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds dependencies section', async () => {
    vi.mocked(buildSectionItem).mockReturnValue(Effect.succeed('Dependencies description'))

    const result = await runQAWithEnvOrThrow(buildDependencies.build(context), PlatformLayer)

    expect(buildSectionItem).toHaveBeenCalledWith(
      'dependencies',
      context,
      ReadmePromptProvider,
      undefined,
    )

    expect(result).toEqual({
      section: {
        id: 'dependencies',
        title: undefined,
        contents: [
          {
            type: 'paragraph',
            text: 'Dependencies description',
          },
        ],
      },
    })
  })

  it('wraps errors with DocumentBuilderError', async () => {
    vi.mocked(buildSectionItem).mockReturnValue(
      Effect.fail(
        new AiError({
          cause: undefined,
          message: 'AI failed',
          model: 'test',
          operation: 'generate' as const,
          phase: 'request' as const,
          resolution: { _tag: 'fail' },
        }),
      ),
    )

    await expect(
      runQAWithEnvOrThrow(buildDependencies.build(context), PlatformLayer),
    ).rejects.toBeInstanceOf(DocumentBuilderError)
  })

  it('is always enabled', () => {
    expect(buildDependencies.enabled(context)).toBe(true)
  })
})
