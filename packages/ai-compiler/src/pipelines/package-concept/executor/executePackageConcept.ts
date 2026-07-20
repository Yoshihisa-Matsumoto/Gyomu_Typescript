import { Effect } from 'effect'
import { AiModelRoute, ModelRouteId } from '@gyomu/ai'
import { MessageRole } from '@gyomu/schema/conversation'
import { PackageConceptSchema } from '@gyomu/schema/schemas/concept'
import { loadPrompt } from '../prompt/loadPrompt.js'
import { renderPackageAnalysis } from '../renderer/renderPackageAnalysis.js'
import type { PackageConcept } from '@gyomu/schema/schemas/concept'
import type { PackageAnalysis } from '@gyomu/schema/concept'
import type { AiError, IOError, RetryOption } from '@gyomu/schema'
import type { ModelRoutes, RouteNotFoundError } from '@gyomu/ai'
import type { FileSystem } from 'effect'

export const PackageConceptRouteId = ModelRouteId('package-concept')
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
      routeId: PackageConceptRouteId,
      key: 'fast',
      messages: [{ id: '1', role: MessageRole.user, content: userPrompt }],
      schema: PackageConceptSchema,
      retryOption,
    })
    return result.object
  })
}
