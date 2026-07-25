import { pathExists, readJsonFromFileAndValidate } from '@gyomu/infra/fs'
import { SchemaValidationError, wrapInfraError } from '@gyomu/schema'
import { PackageConceptSchema } from '@gyomu/schema/schemas/concept'
import { Effect } from 'effect'
import { flattenIssues } from '@gyomu/schema/entity'
import { ConceptError } from '../../error/ConceptError.js'
import { getPackageConceptPath } from './getPackageConceptPath.js'
import type { FileSystem } from 'effect'
import type { PackageConcept } from '@gyomu/schema/schemas/concept'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { ConceptOptions } from '../../ConceptOptions.js'

export const loadPackageConcept = (
  context: ProjectContext,
  option?: ConceptOptions,
): Effect.Effect<PackageConcept | undefined, ConceptError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const packageConceptPath = getPackageConceptPath(context, option)

    // FullPath(
    //   join(context.projectRoot, '.gyomu', targetDirectory, '$Directory' + '.json'),
    // )
    // console.log(directoryConceptPath)
    const fileExists = yield* pathExists(packageConceptPath)
    if (!fileExists) return undefined
    const result = yield* readJsonFromFileAndValidate(
      'PackageConcept',
      PackageConceptSchema,
      packageConceptPath,
    )
    return result
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(ConceptError, e, (e2) => ({
        packageName: context.projectName,
        filePath: context.projectRoot,
        message: 'Fail to load Package Concept',
        phase: 'package-concept' as const,
        context: context.projectRoot,
        details:
          e2 instanceof SchemaValidationError
            ? e2.issues
              ? flattenIssues(e2.issues as any)
              : undefined
            : undefined,
      })),
    ),
  )
