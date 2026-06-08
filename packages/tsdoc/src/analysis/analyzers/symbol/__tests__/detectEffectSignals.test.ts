import { describe, expect, it } from 'vitest'
import { detectEffectSignals } from '../analyzeEffectType.js'

describe('detectEffectSignals', () => {
  describe('non effect types', () => {
    it('returns undefined for primitive type', () => {
      expect(detectEffectSignals('string')).toBeUndefined()
    })

    it('returns undefined for generic type', () => {
      expect(detectEffectSignals('Promise<User>')).toBeUndefined()
    })
  })

  describe('simple effect', () => {
    it('detects success type only', () => {
      expect(detectEffectSignals('Effect.Effect<FunnyStructure>')).toEqual({
        returnsEffect: true,

        success: {
          text: 'FunnyStructure',
        },

        error: undefined,

        requirements: undefined,

        hasErrorType: false,

        hasRequirementsType: false,

        effectDepth: 1,
      })
    })

    it('supports Effect namespace omitted', () => {
      expect(detectEffectSignals('Effect<FunnyStructure>')).toEqual({
        returnsEffect: true,

        success: {
          text: 'FunnyStructure',
        },

        error: undefined,

        requirements: undefined,

        hasErrorType: false,

        hasRequirementsType: false,

        effectDepth: 1,
      })
    })
  })

  describe('effect with error', () => {
    it('detects error type', () => {
      expect(detectEffectSignals('Effect.Effect<FunnyStructure,AiError>')).toEqual({
        returnsEffect: true,

        success: {
          text: 'FunnyStructure',
        },

        error: {
          text: 'AiError',
        },

        requirements: undefined,

        hasErrorType: true,

        hasRequirementsType: false,

        effectDepth: 1,
      })
    })
  })

  describe('effect with requirements', () => {
    it('detects requirements type', () => {
      expect(detectEffectSignals('Effect.Effect<FunnyStructure,AiError,AiEngineService>')).toEqual({
        returnsEffect: true,

        success: {
          text: 'FunnyStructure',
        },

        error: {
          text: 'AiError',
        },

        requirements: {
          text: 'AiEngineService',
        },

        hasErrorType: true,

        hasRequirementsType: true,

        effectDepth: 1,
      })
    })
  })

  describe('nested generic arguments', () => {
    it('supports generic success type', () => {
      expect(detectEffectSignals('Effect.Effect<FunnyStructure<TypeA,TypeB>>')).toEqual({
        returnsEffect: true,

        success: {
          text: 'FunnyStructure<TypeA,TypeB>',
        },

        error: undefined,

        requirements: undefined,

        hasErrorType: false,

        hasRequirementsType: false,

        effectDepth: 1,
      })
    })

    it('supports generic error type', () => {
      expect(detectEffectSignals('Effect.Effect<FunnyStructure<TypeA,TypeB>,TypeError>')).toEqual({
        returnsEffect: true,

        success: {
          text: 'FunnyStructure<TypeA,TypeB>',
        },

        error: {
          text: 'TypeError',
        },

        requirements: undefined,

        hasErrorType: true,

        hasRequirementsType: false,

        effectDepth: 1,
      })
    })

    it('supports generic requirements type', () => {
      expect(
        detectEffectSignals(
          'Effect.Effect<FunnyStructure<TypeA,TypeB>,TypeError,CollaborativeService<TypeB,TypeC>>',
        ),
      ).toEqual({
        returnsEffect: true,

        success: {
          text: 'FunnyStructure<TypeA,TypeB>',
        },

        error: {
          text: 'TypeError',
        },

        requirements: {
          text: 'CollaborativeService<TypeB,TypeC>',
        },

        hasErrorType: true,

        hasRequirementsType: true,

        effectDepth: 1,
      })
    })
  })

  describe('nested effect', () => {
    it('calculates effect depth', () => {
      expect(detectEffectSignals('Effect.Effect<Effect.Effect<User>>')).toEqual({
        returnsEffect: true,

        success: {
          text: 'Effect.Effect<User>',

          effect: {
            returnsEffect: true,

            success: {
              text: 'User',
            },

            hasErrorType: false,
            hasRequirementsType: false,

            effectDepth: 1,
          },
        },

        hasErrorType: false,
        hasRequirementsType: false,

        effectDepth: 2,
      })
    })
  })
})
