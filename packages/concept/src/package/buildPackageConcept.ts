import { Effect } from 'effect'
import { logger } from '@gyomu/schema'
import { loadPackageConcept } from './internal/loadPackageConcept.js'
import { buildPackageAnalysis } from './buildPackageAnalysis.js'
import { generatePackageInsight } from './internal/generatePackageConcept.js'
import { savePackageConcept } from './internal/savePackageConcept.js'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { ConceptError } from '../error/ConceptError.js'
import type { FileSystem } from 'effect'
import type { PackageConcept, PackageDependency } from '@gyomu/schema/schemas/concept'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { FileSearchService } from '@gyomu/schema/shared/fs'

export const buildPackageConcept = (
  context: ProjectContext,
  option?: ConceptOptions,
): Effect.Effect<
  PackageConcept,
  ConceptError,
  FileSystem.FileSystem | AiModelRoute | ModelRoutes | FileSearchService
> =>
  Effect.gen(function* () {
    if (option?.changedFiles) {
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
    console.dir(packageAnalysis, { depth: null })
    const packageInsight = yield* generatePackageInsight(packageAnalysis, option)
    const packageConcept: PackageConcept = {
      ...packageInsight,
      packageInfo: {
        name: packageAnalysis.package.name,
        private: packageAnalysis.package.private,
        type: packageAnalysis.package.type,
        version: packageAnalysis.package.version,
        description: packageAnalysis.package.description,
      },
      publicApi: packageAnalysis.exportedFiles.map((f) => ({
        exportPath: f.path,
        symbols: f.exports.map((e) => ({ kind: e.kind, name: e.symbol, summary: e.summary })),
      })),
      dependencies: packageAnalysis.dependencies.map(
        (dep) =>
          ({
            packageName: dep.packageName,
            source: dep.source,
            version: dep.resolvedVersion ?? '',
          }) satisfies PackageDependency,
      ),
    }
    yield* savePackageConcept(context, packageConcept)
    return packageConcept
  })
