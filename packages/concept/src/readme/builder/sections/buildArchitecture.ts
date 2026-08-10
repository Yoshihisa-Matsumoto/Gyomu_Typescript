import { Effect } from 'effect'
import { buildSectionItem } from '@gyomu/ai-compiler/document'
import { wrapInfraError } from '@gyomu/schema'
import { ReadmePromptProvider } from '@gyomu/ai-compiler/readme'
import { DocumentBuilderError } from '../../../error/DocumentBuilderError.js'
import type { ConceptOptions } from '../../../ConceptOptions.js'
import type { SectionBuilder } from '../../../document/builder/SectionBuilder.js'
import type { FileSystem } from 'effect'
import type { Section } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext, ReadmeSectionId } from '@gyomu/schema/concept'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'

/**
 * A readme section builder that generates the 'architecture' section for the package documentation.
 *
 * @returns An effect that produces a structured readme section containing the project architecture overview.
 */
export const buildArchitecture: SectionBuilder<
  ReadmeSectionId,
  ReadmeBuildContext,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> = {
  id: 'architecture',

  build: (context: ReadmeBuildContext, option?: ConceptOptions) =>
    Effect.gen(function* () {
      const overviewResult = yield* buildSectionItem(
        'architecture',
        context,
        ReadmePromptProvider,
        option?.retryOption,
      )
      return {
        section: {
          id: 'architecture',
          title: undefined,
          contents: [
            {
              type: 'paragraph',
              text: overviewResult,
            },
          ],
        } satisfies Section,
      }
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
  translation: { strategy: 'translate', translations: [] },
  enabled: () => true,
}
