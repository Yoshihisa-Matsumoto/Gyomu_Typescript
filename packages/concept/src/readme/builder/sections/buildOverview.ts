import { Effect } from 'effect'
import { buildSectionItem } from '@gyomu/ai-compiler/readme'
import { wrapInfraError } from '@gyomu/schema'
import { DocumentBuilderError } from '../../../error/DocumentBuilderError.js'
import type { SectionBuilder } from '../../../document/builder/SectionBuilder.js'
import type { FileSystem } from 'effect'
import type { Section } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext, ReadmeSectionId } from '@gyomu/schema/concept'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'

/**
 * A README section builder that generates the overview content based on the project's analysis context.
 */
export const buildOverview: SectionBuilder<
  ReadmeSectionId,
  ReadmeBuildContext,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> = {
  id: 'overview',

  build: (context: ReadmeBuildContext) =>
    Effect.gen(function* () {
      const overviewResult = yield* buildSectionItem('overview', context)
      return {
        id: 'overview',
        title: undefined,
        contents: [
          {
            type: 'paragraph',
            text: overviewResult,
          },
        ],
      } satisfies Section
    }).pipe(
      Effect.mapError((e) =>
        wrapInfraError(DocumentBuilderError, e, (e) => ({
          filePath: 'README.md',
          packageName: context.analysis.package.name,
          phase: 'section-build' as const,
          sectionId: 'overview',
          cause: e,
        })),
      ),
    ),
  enabled: () => true,
}
