import { Effect } from 'effect'
import { writeStringToFile } from '@gyomu/infra/fs'
import { convertFromSchemaObjectToJsonWithEffect, flattenIssues } from '@gyomu/schema/entity'
import { DirectoryConcept } from '@gyomu/schema/schemas/concept'

import { SchemaValidationError, wrapInfraError } from '@gyomu/schema'
import { ConceptError } from '../../error/ConceptError.js'
import { getDirectoryConceptPath } from './getDirectoryConceptPath.js'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

/**
 * Saves a directory concept to a JSON file within the project's .gyomu directory.
 *
 * @param context The current project context containing root paths and project metadata.
 *
 * @param targetDirectory The relative path to the directory where the concept is saved.
 *
 * @param concept The directory concept data to persist.
 *
 * @param option Optional configuration for saving the concept.
 *
 * @returns An Effect that completes when the file is successfully written, or fails with a ConceptError.
 */
export const saveDirectoryConcept = (
  context: ProjectContext,
  targetDirectory: ProjectRelativePath,
  concept: DirectoryConcept,
  option?: ConceptOptions,
) =>
  Effect.gen(function* () {
    const directoryConceptPath = getDirectoryConceptPath(context, targetDirectory, option)

    // join(
    //   context.projectRoot,
    //   '.gyomu',
    //   targetDirectory,
    //   '$Directory.json',
    // )
    const jsonString = yield* convertFromSchemaObjectToJsonWithEffect('DirectoryConcept')(
      DirectoryConcept,
      concept,
    )
    yield* writeStringToFile(directoryConceptPath, jsonString)
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(ConceptError, e, (e) => ({
        packageName: context.projectName,
        filePath: targetDirectory,
        message: 'Fail to save Directory Concept',
        phase: 'directory-summary' as const,
        context: context.projectRoot,
        details:
          e instanceof SchemaValidationError
            ? e.issues
              ? flattenIssues(e.issues as any)
              : undefined
            : undefined,
      })),
    ),
  )
