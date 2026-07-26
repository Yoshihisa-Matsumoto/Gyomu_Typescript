import { Effect } from 'effect'
import { buildSectionItem } from '@gyomu/ai-compiler/readme'
import { wrapInfraError } from '@gyomu/schema'
import { DocumentBuilderError } from '../../../error/DocumentBuilderError.js'
import type { FileSystem } from 'effect'
import type { Section } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { ReadmeSectionBuilder } from '../ReadmeSectionBuilder.js'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'

/**
 * Constructs a documentation section detailing project dependencies.
 */
export const buildDependencies: ReadmeSectionBuilder<
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> = {
  id: 'dependencies',

  build: (context: ReadmeBuildContext) =>
    Effect.gen(function* () {
      const dependencyResult = yield* buildSectionItem('dependencies', context)
      return {
        id: 'dependencies',
        title: undefined,
        contents: [
          {
            type: 'paragraph',
            text: dependencyResult,
          },
        ],
      } satisfies Section
    }).pipe(
      Effect.mapError((e) =>
        wrapInfraError(DocumentBuilderError, e, (e) => ({
          filePath: 'README.md',
          packageName: context.analysis.package.name,
          phase: 'section-build' as const,
          sectionId: 'dependencies',
          cause: e,
        })),
      ),
    ),
  enabled: () => true,
}
