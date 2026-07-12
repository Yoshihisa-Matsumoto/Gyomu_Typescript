import { Effect } from 'effect'
import { wrapInfraError } from '@gyomu/schema'
import { executeDirectoryConcepts } from '@gyomu/ai-compiler/directory-concept'
import { ConceptError } from '../../error/ConceptError.js'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { DirectoryConceptInput } from '@gyomu/schema/concept'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

export const generateDirectoryConcept = (
  targetDirectory: ProjectRelativePath,
  context: DirectoryConceptInput,
  option?: ConceptOptions,
) =>
  Effect.gen(function* () {
    const summary = yield* executeDirectoryConcepts(context, option?.retryOption)

    return summary
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(ConceptError, e, () => ({
        filePath: targetDirectory,
        message: 'Fail to generate Directory Concept',
        phase: 'directory-summary' as const,
        details: context,
      })),
    ),
  )
