// import { Effect } from 'effect'
// import { buildSectionObject } from '@gyomu/ai-compiler/document'
// import { wrapInfraError } from '@gyomu/schema'
// import { LlmContextPromptProvider } from '@gyomu/ai-compiler/llm-context'
// import { BulletList } from '@gyomu/schema/schemas/document'
// import { DocumentBuilderError } from '../../../error/DocumentBuilderError.js'
// import type { Section } from '@gyomu/schema/schemas/document'
// import type { ConceptOptions } from '../../../ConceptOptions.js'
// import type { SectionBuilder } from '../../../document/builder/SectionBuilder.js'
// import type { FileSystem } from 'effect'
// import type { LlmContextBuildContext, LlmContextSectionId } from '@gyomu/schema/concept'
// import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'

// /**
//  * A readme section builder that generates the 'coding-guideline' section for the package documentation.
//  */
// export const buildCodingGuidelines: SectionBuilder<
//   LlmContextSectionId,
//   LlmContextBuildContext,
//   AiModelRoute | FileSystem.FileSystem | ModelRoutes
// > = {
//   id: 'coding-guidelines',

//   build: (context: LlmContextBuildContext, option?: ConceptOptions) =>
//     Effect.gen(function* () {
//       const codingGuidelineResult = yield* buildSectionObject(
//         'architecture',
//         context,
//         LlmContextPromptProvider,
//         BulletList,
//         option?.retryOption,
//       )
//       return {
//         section: {
//           id: 'architecture',
//           title: undefined,
//           contents: [codingGuidelineResult],
//         } satisfies Section,
//       }
//     }).pipe(
//       Effect.mapError((e) =>
//         wrapInfraError(DocumentBuilderError, e, (e) => ({
//           filePath: 'README.md',
//           packageName: context.analysis.package.name,
//           phase: 'section-build' as const,
//           sectionId: 'architecture',
//           cause: e,
//         })),
//       ),
//     ),
//   enabled: () => true,
// }
