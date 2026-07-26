import { pathExists, readJsonFromFileAndValidate } from '@gyomu/infra/fs'
import { SchemaValidationError, wrapInfraError } from '@gyomu/schema'
import { DirectoryConcept } from '@gyomu/schema/schemas/concept'
import { Effect } from 'effect'
import { flattenIssues } from '@gyomu/schema/entity'
import { ConceptError } from '../../error/ConceptError.js'
import { getDirectoryConceptPath } from './getDirectoryConceptPath.js'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { ConceptOptions } from '../../ConceptOptions.js'

/**
 * Loads and validates the DirectoryConcept definition from a directory-specific configuration file.
 *
 * @param context The project context providing root information and naming.
 *
 * @param targetDirectory The path of the directory for which to load the concept.
 *
 * @param option Optional configuration for loading the concept.
 *
 * @returns An Effect that yields the DirectoryConcept if found and valid, or undefined if the configuration file does not exist. Fails with a ConceptError if validation or I/O operations fail.
 */
export const loadDirectoryConcept = (
  context: ProjectContext,
  targetDirectory: ProjectRelativePath,
  option?: ConceptOptions,
) =>
  Effect.gen(function* () {
    const directoryConceptPath = getDirectoryConceptPath(context, targetDirectory, option)

    // FullPath(
    //   join(context.projectRoot, '.gyomu', targetDirectory, '$Directory' + '.json'),
    // )
    // console.log(directoryConceptPath)
    const fileExists = yield* pathExists(directoryConceptPath)
    if (!fileExists) return undefined
    return yield* readJsonFromFileAndValidate(
      'DirectoryConcept',
      DirectoryConcept,
      directoryConceptPath,
    )
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(ConceptError, e, (e2) => ({
        packageName: context.projectName,
        filePath: targetDirectory,
        message: 'Fail to load Directory Concept',
        phase: 'directory-summary' as const,
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
