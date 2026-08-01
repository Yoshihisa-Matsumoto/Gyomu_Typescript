import { Effect, Schema } from 'effect'
import { describe, expect, it, vi } from 'vitest'
import { PlatformLayer } from '@gyomu/infra'
import { IOError, TranslationError, getFailureFromExit } from '@gyomu/schema'
import { buildTranslationPrompt } from '../buildTranslationPrompt.js'
import * as PromptModule from '../../prompt/index.js'
import type { DocumentContentTranslationStrategy } from '@gyomu/schema/document'

const TestSchema = Schema.Struct({
  type: Schema.Literal('paragraph'),
  text: Schema.String,
})

const TestStrategy: DocumentContentTranslationStrategy<typeof TestSchema> = {
  definition: {
    schema: TestSchema,
    translationInstruction: 'Keep technical terms unchanged.',
    reconciliation: { validate: () => ({ issues: [], isValid: true }) },
    type: 'paragraph',
  },

  retryContextUpdater: (args) => Effect.succeed(args.originalContext),
}

describe('buildTranslationPrompt', () => {
  it('builds translation prompt with section and strategy instructions', async () => {
    const result = await Effect.runPromise(
      buildTranslationPrompt({
        language: 'ja',
        context: {
          type: 'paragraph',
          text: 'Hello',
        },
        sectionDefinition: {
          id: 'overview',
          translationInstruction: 'Translate for README readers.',
          translations: [TestStrategy],
        },
        contentStrategy: TestStrategy,
        validationResult: undefined,
      }).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result).toContain('Translate for README readers.')
    expect(result).toContain('Keep technical terms unchanged.')
    expect(result).toContain('ja')
    expect(result).toContain('"text": "Hello"')
  })
  it('does not add section instruction when it is undefined', async () => {
    const result = await Effect.runPromise(
      buildTranslationPrompt({
        language: 'ja',
        context: {
          type: 'paragraph',
          text: 'Hello',
        },
        sectionDefinition: {
          id: 'overview',
          translations: [TestStrategy],
        },
        contentStrategy: TestStrategy,
        validationResult: undefined,
      }).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result).not.toContain('undefined')
  })
  it('includes validation issues for retry prompt', async () => {
    const result = await Effect.runPromise(
      buildTranslationPrompt({
        language: 'ja',
        context: {
          type: 'paragraph',
          text: 'Hello',
        },
        sectionDefinition: {
          id: 'overview',
          translations: [TestStrategy],
        },
        contentStrategy: TestStrategy,
        validationResult: {
          isValid: false,
          issues: [
            {
              code: 'abc',
              message: 'abc',
              repairInstruction: 'Preserve the number of items.',
            },
            { code: 'abc', message: 'abc', repairInstruction: 'Do not translate package names.' },
          ],
        },
      }).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result).toContain('- Preserve the number of items.')

    expect(result).toContain('- Do not translate package names.')
  })
  it('does not include validation issues when validation succeeds', async () => {
    const result = await Effect.runPromise(
      buildTranslationPrompt({
        language: 'ja',
        context: {
          type: 'paragraph',
          text: 'Hello',
        },
        sectionDefinition: {
          id: 'overview',
          translations: [TestStrategy],
        },
        contentStrategy: TestStrategy,
        validationResult: {
          isValid: true,
          issues: [],
        },
      }).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result).not.toContain('the number of items.')
  })
  it('wraps prompt loading errors as TranslationError', async () => {
    vi.spyOn(PromptModule, 'loadPrompt').mockReturnValueOnce(
      Effect.fail(
        new IOError({
          message: 'fail to load prompt',
          cause: undefined,
          layer: 'filesystem',
          operation: 'read',
        }),
      ),
    )

    const TestSchema = Schema.Struct({
      type: Schema.Literal('paragraph'),
      text: Schema.String,
    })

    const strategy = {
      definition: {
        schema: TestSchema,
        translationInstruction: 'Translate naturally.',
      },
    } as any

    const effect = buildTranslationPrompt({
      language: 'ja',
      context: {
        type: 'paragraph' as const,
      },
      sectionDefinition: {
        id: 'overview',
      } as any,
      contentStrategy: strategy,
      validationResult: undefined,
    })

    const error = await Effect.runPromiseExit(effect.pipe(Effect.provide(PlatformLayer)))

    expect(error._tag).toBe('Failure')

    if (error._tag !== 'Failure') {
      throw new Error('Expected Failure')
    }

    const cause = getFailureFromExit(error)

    expect(cause).toBeInstanceOf(TranslationError)
    expect(cause.phase).toBe('prompt')
    expect(cause.sectionId).toBe('overview')
    expect(cause.contentType).toBe('paragraph')
    expect(cause.message).toBe('fail to build prompt message')
  })
})
