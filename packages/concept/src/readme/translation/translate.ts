import { executeTranslation } from '@gyomu/ai-compiler/translation'
import { Effect } from 'effect'
import { wrapInfraError } from '@gyomu/schema'
import { DocumentBuilderError } from '../../error/DocumentBuilderError.js'
import type { FileSystem } from 'effect'
import type {
  LanguageCodes,
  TranslationResult,
  TranslationTarget,
} from '@gyomu/schema/schemas/document'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'

export const translate = (
  context: ReadmeBuildContext,
  language: LanguageCodes,
  targets: ReadonlyArray<TranslationTarget>,
): Effect.Effect<
  TranslationResult,
  DocumentBuilderError,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> =>
  executeTranslation(context.analysis.package.name, {
    targetLanguage: language,
    translations: targets.map((t) => ({ id: t.id, source: t.source })),
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(DocumentBuilderError, e, () => ({
        message: 'fail to translate',
        phase: 'translate' as const,
        packageName: context.analysis.package.name,
      })),
    ),
  )
