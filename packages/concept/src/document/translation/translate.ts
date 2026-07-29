import { Effect } from 'effect'
import { wrapInfraError } from '@gyomu/schema'
import { DocumentBuilderError } from '../../error/DocumentBuilderError.js'
import type {
  LanguageCodes,
  TranslationResult,
  TranslationTarget,
} from '@gyomu/schema/schemas/document'
import type { DocumentBaseContext } from '@gyomu/schema/concept'

export type ExecuteTranslation<TContext, R = never> = (
  context: TContext,
  language: LanguageCodes,
  targets: ReadonlyArray<TranslationTarget>,
) => Effect.Effect<TranslationResult, unknown, R>

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
