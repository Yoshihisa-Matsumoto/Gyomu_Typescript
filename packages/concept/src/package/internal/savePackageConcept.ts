import { Effect } from 'effect'
import { writeStringToFile } from '@gyomu/infra/fs'
import { convertFromSchemaObjectToJsonWithEffect, flattenIssues } from '@gyomu/schema/entity'
import { PackageConceptSchema } from '@gyomu/schema/schemas/concept'
import { SchemaValidationError, wrapInfraError } from '@gyomu/schema'
import { ConceptError } from '../../error/ConceptError.js'
import { getPackageConceptPath } from './getPackageConceptPath.js'
import type { PackageConcept } from '@gyomu/schema/schemas/concept'

import type { ProjectContext } from '@gyomu/ts-analysis'

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
