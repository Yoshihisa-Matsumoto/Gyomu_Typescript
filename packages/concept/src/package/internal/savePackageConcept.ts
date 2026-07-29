import { Effect } from 'effect'
import { writeStringToFile } from '@gyomu/infra/fs'
import { convertFromSchemaObjectToJsonWithEffect, flattenIssues } from '@gyomu/schema/entity'
import { PackageConceptSchema } from '@gyomu/schema/schemas/concept'
import { SchemaValidationError, wrapInfraError } from '@gyomu/schema'
import { ConceptError } from '../../error/ConceptError.js'
import { getPackageConceptPath } from './getPackageConceptPath.js'
import type { PackageConcept } from '@gyomu/schema/schemas/concept'

import type { ProjectContext } from '@gyomu/ts-analysis'

/**
 * Saves a `PackageConcept` to the project directory by serializing it to JSON and writing it to the path defined by the project context.
 *
 * @param context The project context providing path and naming information.
 *
 * @param concept The concept data to be saved.
 *
 * @returns An `Effect` that resolves when the file is saved, or fails with a `ConceptError` if serialization or file I/O fails.
 */
export const savePackageConcept = (context: ProjectContext, concept: PackageConcept) =>
  Effect.gen(function* () {
    const directoryConceptPath = getPackageConceptPath(context)

    const jsonString = yield* convertFromSchemaObjectToJsonWithEffect('PackageConcept')(
      PackageConceptSchema,
      concept,
    )
    yield* writeStringToFile(directoryConceptPath, jsonString)
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(ConceptError, e, (e) => ({
        packageName: context.projectName,
        filePath: context.projectRoot,
        message: 'Fail to save Package Concept',
        phase: 'package-concept' as const,
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
