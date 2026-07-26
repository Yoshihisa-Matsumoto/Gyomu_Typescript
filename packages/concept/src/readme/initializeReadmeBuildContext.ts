import { join } from 'node:path'
import { Effect } from 'effect'
import { readYamlFromFileAndValidate } from '@gyomu/infra/fs'
import { Development, Package, Roadmap, Technical } from '@gyomu/schema/schemas/knowledge'
import { wrapInfraError } from '@gyomu/schema'
import { DocumentBuilderError } from '../error/DocumentBuilderError.js'
import { buildPackageAnalysis } from '../package/buildPackageAnalysis.js'
import { loadPackageConcept } from '../package/internal/loadPackageConcept.js'
import { getPackageConceptPath } from '../package/internal/getPackageConceptPath.js'
import { getKnowledgePath } from './internal/getKnowledgePath.js'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { FileSystem } from 'effect'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { FileSearchService } from '@gyomu/schema/shared/fs'

/**
 * Initializes the build context required for documentation generation by aggregating package analysis, concept definitions, and various knowledge artifacts.
 *
 * @param context The project context containing project metadata.
 *
 * @param option Optional configuration for the concept build process.
 *
 * @returns An Effect that resolves to the initialized ReadmeBuildContext or fails with a DocumentBuilderError.
 *
 * @requires FileSystem.FileSystem | FileSearchService
 */
export const initializeReadmeBuildContext = (
  context: ProjectContext,
  option?: ConceptOptions,
): Effect.Effect<
  ReadmeBuildContext,
  DocumentBuilderError,
  FileSystem.FileSystem | FileSearchService
> =>
  Effect.gen(function* () {
    const analysis = yield* buildPackageAnalysis(context, option)
    const concept = yield* loadPackageConcept(context, option)
    if (!concept) {
      return yield* Effect.fail(
        new DocumentBuilderError({
          message: 'Package Concept not found',
          filePath: getPackageConceptPath(context, option),
          packageName: context.projectName,
          phase: 'context-build' as const,
          cause: undefined,
        }),
      )
    }
    const knowledgePath = getKnowledgePath(context, option)
    const packageKnowledge = yield* readYamlFromFileAndValidate(
      'Package',
      Package,
      join(knowledgePath, 'Package.yaml'),
    )
    const development = yield* readYamlFromFileAndValidate(
      'Development',
      Development,
      join(knowledgePath, 'Development.yaml'),
    )
    const technical = yield* readYamlFromFileAndValidate(
      'Technical',
      Technical,
      join(knowledgePath, 'Technical.yaml'),
    )
    const roadmap = yield* readYamlFromFileAndValidate(
      'Roadmap',
      Roadmap,
      join(knowledgePath, 'Roadmap.yaml'),
    ).pipe(Effect.catch(() => Effect.succeed(undefined)))

    const resultContext = {
      analysis,
      concept,
      knowledge: {
        package: packageKnowledge,
        development,
        technical,
        roadmap,
      },
    } satisfies ReadmeBuildContext
    return resultContext
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(DocumentBuilderError, e, () => ({
        packageName: context.projectName,
        phase: 'context-build' as const,
        message: 'Fail to build context',
      })),
    ),
  )
