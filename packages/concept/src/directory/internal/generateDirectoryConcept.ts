import { Effect } from 'effect'
import { wrapInfraError } from '@gyomu/schema'
import { executeDirectoryConcepts } from '@gyomu/ai-compiler/directory-concept'
import { ConceptError } from '../../error/ConceptError.js'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { DirectoryConceptInput } from '@gyomu/schema/concept'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { FileSystem } from 'effect/FileSystem'
import type { DirectoryConcept } from '@gyomu/schema/schemas/concept'

export const generateDirectoryConcept = (
  packageName: string,
  targetDirectory: ProjectRelativePath,
  context: DirectoryConceptInput,
  option?: ConceptOptions,
): Effect.Effect<DirectoryConcept, ConceptError, AiModelRoute | FileSystem | ModelRoutes> =>
  Effect.gen(function* () {
    const summary = yield* executeDirectoryConcepts(context, option?.retryOption)

    return summary
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(ConceptError, e, () => ({
        packageName,
        filePath: targetDirectory,
        message: 'Fail to generate Directory Concept',
        phase: 'directory-summary' as const,
        details: context,
      })),
    ),
  )
