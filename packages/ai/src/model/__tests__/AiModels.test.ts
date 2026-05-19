import { describe, expect, it } from 'vitest'
import { AI_MODELS } from '../AiModels.js'

describe('AI_MODELS', () => {
  it('all models are defined', () => {
    expect(AI_MODELS.fast).toBeDefined()
    expect(AI_MODELS.smart).toBeDefined()
    expect(AI_MODELS.reasoning).toBeDefined()
    expect(AI_MODELS.vision).toBeDefined()
    expect(AI_MODELS.embedding).toBeDefined()
  })
})
