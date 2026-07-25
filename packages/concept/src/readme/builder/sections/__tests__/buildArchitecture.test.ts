import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import { buildSectionItem } from '@gyomu/ai-compiler/readme'
import { PlatformLayer } from '@gyomu/infra'
import { AiModelRoute } from '@gyomu/ai'
import { makeRunner } from '@gyomu/schema/effect'
import { AiError } from '@gyomu/schema'
import { buildArchitecture } from '../buildArchitecture.js'
import { DocumentBuilderError } from '../../../../error/DocumentBuilderError.js'

vi.mock('@gyomu/ai-compiler/readme', () => ({
  buildSectionItem: vi.fn(),
}))

const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject: () => Effect.succeed({ object: {} }),
} as any)
const runQAWithEnvOrThrow = makeRunner(mockAiModelService)
describe('buildArchitecture', () => {
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

  it('builds architecture section', async () => {
    vi.mocked(buildSectionItem).mockReturnValue(Effect.succeed('Architecture description'))

    const result = await runQAWithEnvOrThrow(buildArchitecture.build(context), PlatformLayer)

    expect(buildSectionItem).toHaveBeenCalledWith('architecture', context)

    expect(result).toEqual({
      id: 'architecture',
      title: undefined,
      contents: [
        {
          type: 'paragraph',
          text: 'Architecture description',
        },
      ],
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
      runQAWithEnvOrThrow(buildArchitecture.build(context), PlatformLayer),
    ).rejects.toBeInstanceOf(DocumentBuilderError)
  })

  it('is always enabled', () => {
    expect(buildArchitecture.enabled(context)).toBe(true)
  })
})
