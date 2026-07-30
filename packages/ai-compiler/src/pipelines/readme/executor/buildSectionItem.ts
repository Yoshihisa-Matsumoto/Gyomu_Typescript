// import { Effect } from 'effect'
// import { AiModelRoute, ModelRouteId } from '@gyomu/ai'
// import { SectionPromptMap } from '../renderer/renderSectionInput.js'
// import type { ReadmeBuildContext } from '@gyomu/schema/concept'
// import type { AiError, IOError, RetryOption } from '@gyomu/schema'
// import type { ModelRoutes, RouteNotFoundError } from '@gyomu/ai'
// import type { FileSystem } from 'effect'
// import type { SupportedSectionId } from '../renderer/renderSectionInput.js'

// /**
//  * Defines the identifier for readme section routes used in the AI model routing system.
//  */
// export const ReadmeSectionRouteId = ModelRouteId('readme-section')

// /**
//  * Builds a specific section of a readme document by generating content using an AI model.
//  *
//  * @param sectionId The identifier of the section to be built.
//  *
//  * @param context The build context containing necessary information for rendering.
//  *
//  * @param retryOption Optional retry configuration for the generation request.
//  *
//  * @returns An Effect that resolves to the generated section text or fails with an IOError, AiError, or RouteNotFoundError.
//  *
//  * @requirements {AiModelRoute|FileSystem.FileSystem|ModelRoutes} Requires the AiModelRoute, FileSystem, and ModelRoutes services.
//  */
// export const buildSectionItem = (
//   sectionId: SupportedSectionId,
//   context: ReadmeBuildContext,
//   retryOption?: RetryOption,
// ): Effect.Effect<
//   string,
//   IOError | AiError | RouteNotFoundError,
//   AiModelRoute | FileSystem.FileSystem | ModelRoutes
// > => {
//   return Effect.gen(function* () {
//     const service = yield* AiModelRoute
//     const renderer = SectionPromptMap[sectionId]
//     const messages = yield* renderer(context)

//     const result = yield* service.generateText({
//       routeId: ReadmeSectionRouteId,
//       key: 'fast',
//       messages,
//       retryOption,
//     })
//     return result.message.text
//   })
// }
