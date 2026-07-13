import { Effect } from 'effect'
import { writeStringToFile } from '@gyomu/infra/fs'
import { convertFromSchemaObjectToJsonWithEffect, flattenIssues } from '@gyomu/schema/entity'
import { DirectoryConcept } from '@gyomu/schema/schemas/concept/DirectoryConcept'

import { SchemaValidationError, wrapInfraError } from '@gyomu/schema'
import { ConceptError } from '../../error/ConceptError.js'
import { getDirectoryConceptPath } from './getDirectoryConceptPath.js'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

export const saveDirectoryConcept = (
  context: ProjectContext,
  targetDirectory: ProjectRelativePath,
  concept: DirectoryConcept,
) =>
  Effect.gen(function* () {
    const directoryConceptPath = getDirectoryConceptPath(context, targetDirectory)

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
        filePath: targetDirectory,
        message: 'Fail to load Directory Concept',
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
