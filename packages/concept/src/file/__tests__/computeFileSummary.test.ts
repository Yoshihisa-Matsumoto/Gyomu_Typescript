/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Effect, Layer } from 'effect'
import { describe, expect, test, vi } from 'vitest'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { AiModelRoute } from '@gyomu/ai'
import { makeRunner } from '@gyomu/schema/effect'
import { computeFileSummary } from '../computeFileSummary.js'

const { buildFilConceptInput, generateSummary } = vi.hoisted(() => ({
  buildFilConceptInput: vi.fn(),
  generateSummary: vi.fn(),
}))

vi.mock('../internal/buildFileConceptInput.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../internal/buildFileConceptInput.js')>()),
  buildFilConceptInput,
}))

vi.mock('../internal/generateSummary.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../internal/generateSummary.js')>()),
  generateSummary,
}))

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject: () =>
    Effect.succeed({
      object: {},
    }),
} as any)
const runQAWithEnvOrThrow = makeRunner(mockAiModelService)

describe('computeFileSummary', () => {
  test('builds input and generates summary', async () => {
    const context = {} as any
    const option = {} as any
    const input = { path: 'a.ts', exports: [] }

    buildFilConceptInput.mockReturnValue(input)
    generateSummary.mockReturnValue(Effect.succeed('summary'))

    const result = await runQAWithEnvOrThrow(computeFileSummary(context, option), layer)

    expect(result).toBe('summary')
    expect(buildFilConceptInput).toHaveBeenCalledWith(context)
    expect(generateSummary).toHaveBeenCalledWith(input, option)
  })
})
