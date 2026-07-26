import { Effect } from 'effect'
import { AiModelRoute, ModelRouteId } from '@gyomu/ai'
import { MessageRole } from '@gyomu/schema/conversation'
import { TranslationResultSchema } from '@gyomu/schema/schemas/document'
import { loadPrompt } from '../prompt/index.js'
import type { AiError, IOError, RetryOption } from '@gyomu/schema'
import type { ModelRoutes, RouteNotFoundError } from '@gyomu/ai'
import type { FileSystem } from 'effect'
import type { TranslationRequest, TranslationResult } from '@gyomu/schema/schemas/document'

/**
 * The identifier used for the translation model route.
 */
export const TranslationRouteId = ModelRouteId('translation')

/**
 * Executes a translation request by processing input text through an AI model.
 *
 * @param projectName The name of the package associated with the translation request.
 *
 * @param context The translation request configuration, including target language and source text.
 *
 * @param retryOption Optional retry configuration for the AI request.
 *
 * @returns An Effect that resolves to the TranslationResult, or fails with an IOError, AiError, or RouteNotFoundError.
 *
 * @requires AiModelRoute, FileSystem, and ModelRoutes services.
 */
export const executeTranslation = (
  projectName: string,
  context: TranslationRequest,
  retryOption?: RetryOption,
): Effect.Effect<
  TranslationResult,
  IOError | AiError | RouteNotFoundError,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> => {
  return Effect.gen(function* () {
    const service = yield* AiModelRoute
    const basePrompt = yield* loadPrompt('translation.md')
    // const deepPrompt = yield* loadPrompt(deepPromptFilename)
    const userPrompt = basePrompt
      .replace('{{TARGET_LANGUAGE}}', context.targetLanguage)
      .replace('{{PACKAGE_NAME}}', projectName)
      .replace('{{TRANSLATION_TARGETS}}', JSON.stringify(context.translations, null, 2))
    // console.log(userPrompt)
    const result = yield* service.generateObject({
      routeId: TranslationRouteId,
      key: 'fast',
      messages: [{ id: '1', role: MessageRole.user, content: userPrompt }],
      schema: TranslationResultSchema,
      retryOption,
    })
    return result.object
  })
}
