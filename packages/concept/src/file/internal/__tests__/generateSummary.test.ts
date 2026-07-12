/* eslint-disable import/first */
import { beforeEach, describe, expect, test, vi } from 'vitest'

const { executeFileSummary, writeStringToFile } = vi.hoisted(() => ({
  executeFileSummary: vi.fn(),
  writeStringToFile: vi.fn(),
}))

vi.mock('@gyomu/ai-compiler/file-summary', () => ({
  executeFileSummary,
}))

vi.mock('@gyomu/infra/fs', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@gyomu/infra/fs')>()

  return {
    ...actual,
    writeStringToFile,
  }
})

import { Effect, Layer } from 'effect'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { AiModelRoute } from '@gyomu/ai'
import { makeRunner } from '@gyomu/schema/effect'

import { ConceptError } from '../../../error/ConceptError.js'

// eslint-disable-next-line import/first
import { generateSummary } from '../generateSummary.js'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject: () =>
    Effect.succeed({
      object: {},
    }),
} as any)
const runQAWithEnvOrThrow = makeRunner(mockAiModelService)

describe('generateSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns generated summary', async () => {
    executeFileSummary.mockReturnValue(Effect.succeed('summary'))

    const context = {
      path: 'src/test.ts',
      exports: [],
    }

    const result = await runQAWithEnvOrThrow(generateSummary(context), layer)

    expect(result).toBe('summary')
    expect(executeFileSummary).toHaveBeenCalledWith(context, undefined)
  })

  test('writes debug file', async () => {
    executeFileSummary.mockReturnValue(Effect.succeed('summary'))

    writeStringToFile.mockReturnValue(Effect.void)

    const context = {
      path: 'src/test.ts',
      exports: [],
    }

    await runQAWithEnvOrThrow(
      generateSummary(context, {
        debugInfo: {
          FileSummaryInput: true,
          DumpToFile: true,
        },
        action: {},
        retryOption: {},
      }),
      layer,
    )

    expect(writeStringToFile).toHaveBeenCalledWith(
      './log/FileSummary.txt',
      JSON.stringify('summary', null, 2),
      { flag: 'a' },
    )
  })

  test('wraps error as ConceptError', async () => {
    executeFileSummary.mockReturnValue(Effect.fail(new Error('boom')))

    const context = {
      path: 'src/test.ts',
      exports: [],
    }

    await expect(runQAWithEnvOrThrow(generateSummary(context), layer)).rejects.toBeInstanceOf(
      ConceptError,
    )
  })
})
