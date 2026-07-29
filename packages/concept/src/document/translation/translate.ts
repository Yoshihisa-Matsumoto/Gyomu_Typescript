import { Effect } from 'effect'
import { wrapInfraError } from '@gyomu/schema'
import { DocumentBuilderError } from '../../error/DocumentBuilderError.js'
import type {
  LanguageCodes,
  TranslationResult,
  TranslationTarget,
} from '@gyomu/schema/schemas/document'
import type { DocumentBaseContext } from '@gyomu/schema/concept'

/**
 * Defines a function type for executing document translations using the provided context, language, and targets.
 *
 * @param context The document context used during translation.
 *
 * @param language The target language code.
 *
 * @param targets The list of translation targets.
 *
 * @returns An Effect resulting in the translation output, or an error if the operation fails.
 */
export type ExecuteTranslation<TContext, R = never> = (
  context: TContext,
  language: LanguageCodes,
  targets: ReadonlyArray<TranslationTarget>,
) => Effect.Effect<TranslationResult, unknown, R>

/**
 * Executes a document translation using a provided executor and wraps potential errors into a DocumentBuilderError.
 *
 * @param context The document context.
 *
 * @param language The target language code.
 *
 * @param targets The translation targets.
 *
 * @param executor The translation execution function.
 *
 * @returns An Effect that resolves to the translation result or fails with a DocumentBuilderError.
 */
export const translate = <TContext extends DocumentBaseContext, R>(
  context: TContext,
  language: LanguageCodes,
  targets: ReadonlyArray<TranslationTarget>,
  executor: ExecuteTranslation<TContext, R>,
): Effect.Effect<TranslationResult, DocumentBuilderError, R> =>
  executor(context, language, targets).pipe(
    Effect.mapError((e) =>
      wrapInfraError(DocumentBuilderError, e, () => ({
        message: 'fail to translate',
        phase: 'translate' as const,
        packageName: context.analysis.package.name,
      })),
    ),
  )
