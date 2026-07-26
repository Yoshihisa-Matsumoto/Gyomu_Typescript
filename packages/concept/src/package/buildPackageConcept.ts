import { Effect } from 'effect'
import { logger } from '@gyomu/schema'
import { writeStringToFile } from '@gyomu/infra/fs'
import { loadPackageConcept } from './internal/loadPackageConcept.js'
import { buildPackageAnalysis } from './buildPackageAnalysis.js'
import { generatePackageConcept } from './internal/generatePackageConcept.js'
import { savePackageConcept } from './internal/savePackageConcept.js'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { ConceptError } from '../error/ConceptError.js'
import type { FileSystem } from 'effect'
import type { PackageConcept } from '@gyomu/schema/schemas/concept'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { FileSearchService } from '@gyomu/schema/shared/fs'

/**
 * Builds a package concept by analyzing project files, optionally loading cached concepts if available, and saving the final result.
 *
 * @param context The project context containing file system access and configuration.
 *
 * @param option Optional configuration for the build process, including debug settings and changed file filtering.
 *
 * @returns An Effect that resolves to a PackageConcept on success, or a ConceptError on failure. Requires FileSystem, AiModelRoute, ModelRoutes, and FileSearchService.
 */
export const buildPackageConcept = (
  context: ProjectContext,
  option?: ConceptOptions,
): Effect.Effect<
  PackageConcept,
  ConceptError,
  FileSystem.FileSystem | AiModelRoute | ModelRoutes | FileSearchService
> =>
  Effect.gen(function* () {
    if (option?.changedFiles && option.changedFiles.length == 0) {
      const packageConcept = yield* loadPackageConcept(context, option).pipe(
        Effect.catch((e) => {
          logger.info(e, 'Error on loadPackageConcept')

          if (e.details) {
            logger.info(e.details, 'Schema Issue')
          }

          return Effect.succeed(undefined)
        }),
      )
      if (packageConcept) {
        return packageConcept
      }
    }

    const packageAnalysis = yield* buildPackageAnalysis(context, option)
    if (option?.debugInfo?.PackageAnalysis) {
      if (option.debugInfo.DumpToFile)
        yield* writeStringToFile(
          './log/PackageAnalysis.txt',
          JSON.stringify(packageAnalysis, null, 2),
        ).pipe(Effect.catch(() => Effect.succeed(undefined)))
      else console.dir(packageAnalysis, { depth: null })
    }
    const packageConcept = yield* generatePackageConcept(packageAnalysis, option)
    if (option?.debugInfo?.PackageConcept) {
      if (option.debugInfo.DumpToFile)
        yield* writeStringToFile(
          './log/PackageConcept.txt',
          JSON.stringify(packageConcept, null, 2),
        ).pipe(Effect.catch(() => Effect.succeed(undefined)))
      else console.dir(packageConcept, { depth: null })
    }
    yield* savePackageConcept(context, packageConcept)
    return packageConcept
  })
