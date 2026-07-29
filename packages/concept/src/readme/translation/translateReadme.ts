import { executeTranslation } from '@gyomu/ai-compiler/translation'
import { translate } from '../../document/translation/translate.js'
import type { Effect, FileSystem } from 'effect'
import type { DocumentBuilderError } from '../../error/DocumentBuilderError.js'
import type {
  LanguageCodes,
  TranslationResult,
  TranslationTarget,
} from '@gyomu/schema/schemas/document'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'

/**
 * Translates the provided documentation targets into the specified language.
 *
 * @param context The readme build context containing the package information.
 *
 * @param language The target language code for translation.
 *
 * @param targets The list of translation targets to process.
 *
 * @returns An Effect that resolves to the TranslationResult, or fails with a DocumentBuilderError, requiring AI models and filesystem access.
 */
export const translateReadme = (
  context: ReadmeBuildContext,
  language: LanguageCodes,
  targets: ReadonlyArray<TranslationTarget>,
): Effect.Effect<
  TranslationResult,
  DocumentBuilderError,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> =>
  translate(context, language, targets, (context, language, targets) =>
    executeTranslation(context.analysis.package.name, {
      targetLanguage: language,
      translations: targets.map((t) => ({ id: t.id, source: t.source })),
    }),
  )
