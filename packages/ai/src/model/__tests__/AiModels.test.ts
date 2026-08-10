import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'

const mocks = vi.hoisted(() => ({
  googleMock: vi.fn(),
  embeddingMock: vi.fn(),
}))

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: vi.fn(() => {
    return Object.assign(mocks.googleMock, {
      embedding: mocks.embeddingMock,
    })
  }),
}))

describe('AiModels', () => {
  beforeEach(() => {
    vi.resetModules()
    mocks.googleMock.mockReset()
    mocks.embeddingMock.mockReset()

    mocks.googleMock.mockImplementation((model: string) => ({
      kind: 'language-model',
      model,
    }))

    mocks.embeddingMock.mockImplementation((model: string) => ({
      kind: 'embedding-model',
      model,
    }))
  })
  describe('AI_MODELS', () => {
    it('all models are defined', async () => {
      const mod = await import('../AiModels.js')
      expect(mod.AI_MODELS.fast).toBeDefined()
      expect(mod.AI_MODELS.smart).toBeDefined()
      expect(mod.AI_MODELS.reasoning).toBeDefined()
      expect(mod.AI_MODELS.vision).toBeDefined()
      expect(mod.AI_MODELS.embedding).toBeDefined()
    })
  })

  it('creates AI_MODELS with expected model ids', async () => {
    const mod = await import('../AiModels.js')

    expect(mod.AI_MODELS.fast).toEqual({
      kind: 'language-model',
      model: 'gemini-3.5-flash-lite',
    })

    expect(mod.AI_MODELS.smart).toEqual({
      kind: 'language-model',
      model: 'gemini-2.5-pro',
    })

    expect(mod.AI_MODELS.reasoning).toEqual({
      kind: 'language-model',
      model: 'gemini-2.5-pro',
    })

    expect(mod.AI_MODELS.vision).toEqual({
      kind: 'language-model',
      model: 'gemini-2.5-pro',
    })

    expect(mod.AI_MODELS.embedding).toEqual({
      kind: 'embedding-model',
      model: 'gemini-embedding-001',
    })
  })

  it('provides registry through layer', async () => {
    const mod = await import('../AiModels.js')

    const registry = await Effect.runPromise(
      Effect.gen(function* () {
        return yield* mod.AiModels
      }).pipe(Effect.provide(mod.MyGoogleModelsLayer)),
    )

    expect(registry).toBe(mod.AI_MODELS)
  })

  it('creates expected google models', async () => {
    await import('../AiModels.js')

    expect(mocks.googleMock).toHaveBeenCalledWith('gemini-3.5-flash-lite')

    expect(mocks.googleMock).toHaveBeenCalledWith('gemini-2.5-pro')

    expect(mocks.embeddingMock).toHaveBeenCalledWith('gemini-embedding-001')
  })

  it('makeGoogleModelRegistry returns AI_MODELS', async () => {
    const mod = await import('../AiModels.js')

    const result = await Effect.runPromise(mod.makeGoogleModelRegistry())

    expect(result).toBe(mod.AI_MODELS)
  })
})
