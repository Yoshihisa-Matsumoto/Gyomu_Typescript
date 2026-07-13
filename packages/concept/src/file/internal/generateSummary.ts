// import { executeFileSummary } from '@gyomu/ai-compiler/file-summary'
// import { Effect } from 'effect'
// import { wrapInfraError } from '@gyomu/schema'
// import { ConceptError } from '../../error/ConceptError.js'
// import type { ConceptOptions } from '../../ConceptOptions.js'
// import type { FileConceptInput } from '@gyomu/ai-compiler/file-summary'

// export const generateSummary = (context: FileConceptInput, option?: ConceptOptions) =>
//   Effect.gen(function* () {
//     const summary = yield* executeFileSummary(context, option?.retryOption)

//     return summary
//   }).pipe(
//     Effect.mapError((e) =>
//       wrapInfraError(ConceptError, e, () => ({
//         filePath: context.path,
//         message: 'Fail to generate File Summary',
//         phase: 'file-summary' as const,
//         details: context,
//       })),
//     ),
//   )
