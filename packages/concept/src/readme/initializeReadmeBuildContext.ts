import { join } from 'node:path'
import { Effect } from 'effect'
import { readYamlFromFileAndValidate } from '@gyomu/infra/fs'
import { Development, Roadmap, Technical } from '@gyomu/schema/schemas/knowledge'
import { wrapInfraError } from '@gyomu/schema'
import { DocumentBuilderError } from '../error/DocumentBuilderError.js'
import { initializeDocumentBaseContext } from '../document/initializeDocumentBaseContext.js'
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
    const baseContext = yield* initializeDocumentBaseContext(context, option)

    const development = yield* readYamlFromFileAndValidate(
      'Development',
      Development,
      join(baseContext.knowledgePath, 'Development.yaml'),
    )
    const technical = yield* readYamlFromFileAndValidate(
      'Technical',
      Technical,
      join(baseContext.knowledgePath, 'Technical.yaml'),
    )
    const roadmap = yield* readYamlFromFileAndValidate(
      'Roadmap',
      Roadmap,
      join(baseContext.knowledgePath, 'Roadmap.yaml'),
    ).pipe(Effect.catch(() => Effect.succeed(undefined)))

    const resultContext = {
      ...baseContext.context,
      knowledge: {
        package: baseContext.context.knowledge.package,
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
