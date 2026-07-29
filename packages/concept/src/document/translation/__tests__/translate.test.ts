import { describe, expect, it } from 'vitest'
import { Effect, Result } from 'effect'
import { translate } from '../translate.js'
import { DocumentBuilderError } from '../../../error/DocumentBuilderError.js'
import type { ExecuteTranslation } from '../translate.js'
import type {
  LanguageCodes,
  TranslationResult,
  TranslationTarget,
} from '@gyomu/schema/schemas/document'
import type { DocumentBaseContext } from '@gyomu/schema/concept'

describe('executeTranslation', () => {
  const context: DocumentBaseContext = {
    analysis: {
      package: {
        name: 'test-package',
      },
    },
  } as DocumentBaseContext

  const targets: ReadonlyArray<TranslationTarget> = [
    {
      id: 'overview',
      source: 'This is overview',
      location: {
        path: [1],
        sectionId: 'overview',
      },
    },
  ]

  const language: LanguageCodes = 'ja'

  it('should execute translation with generated request', async () => {
    const result: TranslationResult = [
      {
        id: 'overview',
        translation: '概要です',
      },
    ] as TranslationResult

    const executor: ExecuteTranslation<any> = () => {
      return Effect.succeed(result)
    }

    const actual = await Effect.runPromise(translate(context, language, targets, executor))

    expect(actual).toEqual(result)
  })

  it('should convert executor error to DocumentBuilderError', async () => {
    const executor: ExecuteTranslation<any> = () => Effect.fail(new Error('translation failed'))

    const either = await Effect.runPromise(
      Effect.result(translate(context, language, targets, executor)),
    )

    expect(Result.isFailure(either)).toBe(true)

    if (Result.isFailure(either)) {
      expect(either.failure).toBeInstanceOf(DocumentBuilderError)
      expect(either.failure.message).toBe('fail to translate')
      expect(either.failure.phase).toBe('translate')
      expect(either.failure.packageName).toBe('test-package')
    }
  })

  it('should preserve required environment from executor', async () => {
    const executor: ExecuteTranslation<any> = () =>
      Effect.succeed([{ id: 'a', translation: '' }] as TranslationResult)

    const result = await Effect.runPromise(translate(context, language, targets, executor))

    expect(result).toEqual(expect.arrayContaining([{ id: 'a', translation: '' }]))
  })
})
