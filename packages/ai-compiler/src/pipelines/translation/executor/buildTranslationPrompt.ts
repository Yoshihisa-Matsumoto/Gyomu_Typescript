import { Effect } from 'effect'
import { toJsonSchemaString } from '@gyomu/schema/entity'
import { TranslationError, wrapInfraError } from '@gyomu/schema'
import { loadPrompt } from '../prompt/index.js'
import type { RetryOption } from '@gyomu/schema'
import type { DocumentContent, LanguageCodes } from '@gyomu/schema/schemas/document'
import type {
  DocumentContentTranslationStrategy,
  SectionTranslationDefinition,
  ValidationResult,
} from '@gyomu/schema/document'
import type { Schema } from 'effect'

/**
 * Builds the translation prompt for a document section by combining templates, translation instructions, context, and validation results.
 *
 * @param args The arguments required to build the translation prompt, including language, section identifier, context, section definition, content strategy, validation results, and optional retry configuration.
 *
 * @returns An Effect containing the populated translation prompt string, or a TranslationError if the prompt building process fails.
 */
export const buildTranslationPrompt = <
  TSchema extends Schema.Schema<{
    readonly type: DocumentContent['type']
  }>,
>(args: {
  language: LanguageCodes
  sectionId: string
  context: Schema.Schema.Type<TSchema>
  sectionDefinition: SectionTranslationDefinition
  contentStrategy: DocumentContentTranslationStrategy<TSchema>
  validationResult: ValidationResult | undefined
  retryOption?: RetryOption | undefined
}) =>
  Effect.gen(function* () {
    const { sectionDefinition, contentStrategy, language, context, validationResult } = args
    const basePrompt = yield* loadPrompt('document-translation.md')

    // const deepPrompt = yield* loadPrompt(deepPromptFilename)
    return basePrompt
      .replace(
        '{{SECTION_INSTRUCTION}}',
        (sectionDefinition.strategy == 'translate' && sectionDefinition.translationInstruction
          ? sectionDefinition.translationInstruction + '\n\n'
          : '') + contentStrategy.definition.translationInstruction,
      )
      .replace('{{TARGET_LANGUAGE}}', language)
      .replace('{{INPUT_SCHEMA}}', toJsonSchemaString(contentStrategy.definition.schema))
      .replace('{{TRANSLATION_TARGETS}}', JSON.stringify(context, null, 2))
      .replace(
        '{{VALIDATION_ISSUES}}',
        !validationResult || validationResult.isValid
          ? ''
          : validationResult.issues.map((i) => `- ${i.repairInstruction}`).join('\n'),
      )
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(TranslationError, e, () => ({
        contentType: args.context.type,
        phase: 'prompt' as const,
        message: 'fail to build prompt message',
        sectionId: args.sectionId,
      })),
    ),
  )
