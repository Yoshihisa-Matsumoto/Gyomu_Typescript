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
 * A readme section builder that generates the 'architecture' section for the package documentation.
 */
export const buildArchitecture: ReadmeSectionBuilder<
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> = {
  id: 'architecture',

  build: (context: ReadmeBuildContext) =>
    Effect.gen(function* () {
      const overviewResult = yield* buildSectionItem('architecture', context)
      return {
        id: 'architecture',
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
          sectionId: 'architecture',
          cause: e,
        })),
      ),
    ),
  enabled: () => true,
}
