import { Effect } from 'effect'
import { wrapInfraError } from '@gyomu/schema'
import { executePackageInsight } from '@gyomu/ai-compiler/package-concept'

import { ConceptError } from '../../error/ConceptError.js'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { PackageAnalysis } from '@gyomu/schema/concept'
import type { FileSystem } from 'effect/FileSystem'
import type { PackageInsight } from '@gyomu/schema/schemas/concept'

export const generatePackageInsight = (
  packageAnalysis: PackageAnalysis,
  option?: ConceptOptions,
): Effect.Effect<PackageInsight, ConceptError, AiModelRoute | FileSystem | ModelRoutes> =>
  Effect.gen(function* () {
    const concept = yield* executePackageInsight(packageAnalysis, option?.retryOption)

    return concept
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(ConceptError, e, () => ({
        packageName: packageAnalysis.package.name,
        filePath: '',
        message: 'Fail to generate Package Concept',
        phase: 'package-concept' as const,
        details: packageAnalysis,
      })),
    ),
  )
