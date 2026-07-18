import { Effect } from 'effect'
import { writeStringToFile } from '@gyomu/infra/fs'
import { convertFromSchemaObjectToJsonWithEffect, flattenIssues } from '@gyomu/schema/entity'
import {
  DirectoryConcept,
  PackageConcept,
  PackageConceptSchema,
} from '@gyomu/schema/schemas/concept'

import { SchemaValidationError, wrapInfraError } from '@gyomu/schema'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'
import { getPackageConceptPath } from './getPackageConceptPath.js'
import { ConceptError } from '../../error/ConceptError.js'

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
