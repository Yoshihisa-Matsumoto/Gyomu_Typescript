// import { Effect } from 'effect'
// import { rankDirectoriesByImportance } from '@gyomu/ai-compiler/domain'
// import type { SectionBuilder } from '../../../document/builder/SectionBuilder.js'
// import type { ConceptOptions } from '../../../ConceptOptions.js'
// import type { LlmContextBuildContext, LlmContextSectionId } from '@gyomu/schema/concept'
// import type { Section } from '@gyomu/schema/schemas/document'

// export const buildDesignPrinciples: SectionBuilder<
//   LlmContextSectionId,
//   LlmContextBuildContext,
//   never
// > = {
//   id: 'design-principles',

//   build: (context: LlmContextBuildContext, option?: ConceptOptions) => {

//     return Effect.succeed({
//       section: {
//         id: 'design-principles',
//         title: undefined,
//         contents: [
//           {
//             type: 'bullet-list',
//             items: context.knowledge.package.
//           },
//         ],
//       } satisfies Section,
//     })
//   },
//   enabled: () => true,
// }
