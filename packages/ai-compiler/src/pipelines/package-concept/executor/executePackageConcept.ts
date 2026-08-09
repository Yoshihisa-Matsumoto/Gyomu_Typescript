import { Effect } from 'effect'
import { AiModelRoute } from '@gyomu/ai'
import { MessageRole } from '@gyomu/schema/conversation'
import { PackageConceptSchema } from '@gyomu/schema/schemas/concept'
import { loadPrompt } from '../prompt/loadPrompt.js'
import { renderPackageAnalysis } from '../renderer/renderPackageAnalysis.js'
import { DocumentSectionRouteId } from '../../document/SectionPromptProvider.js'
import type { PackageConcept } from '@gyomu/schema/schemas/concept'
import type { PackageAnalysis } from '@gyomu/schema/concept'
import type { AiError, IOError, RetryOption } from '@gyomu/schema'
import type { ModelRoutes, RouteNotFoundError } from '@gyomu/ai'
import type { FileSystem } from 'effect'

/**
 * Executes the package concept pipeline to generate a PackageConcept object based on the provided analysis.
 *
 * @param context The input package analysis data to be processed.
 *
 * @param retryOption Optional configuration for handling generation retries.
 *
 * @returns Returns an Effect that resolves to the generated PackageConcept.
 *
 * @requires AiModelRoute, FileSystem, and ModelRoutes services.
 */
export const executePackageConcept = (
  context: PackageAnalysis,
  retryOption?: RetryOption,
): Effect.Effect<
  PackageConcept,
  IOError | AiError | RouteNotFoundError,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> => {
  const promptFilename = `package-concept.md`
  // const deepPromptFilename = `tsdoc-update-deep.md`

  return Effect.gen(function* () {
    const service = yield* AiModelRoute
    const basePrompt = yield* loadPrompt(promptFilename)
    // const deepPrompt = yield* loadPrompt(deepPromptFilename)
    const userPrompt = basePrompt.replace('<##PACKAGE##>', renderPackageAnalysis(context))

    const result = yield* service.generateObject({
      routeId: DocumentSectionRouteId,
      key: 'fast',
      messages: [{ id: '1', role: MessageRole.user, content: userPrompt }],
      schema: PackageConceptSchema,
      retryOption,
    })
    return result.object
  })
}
