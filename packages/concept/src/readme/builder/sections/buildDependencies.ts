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
 * Constructs a documentation section detailing project dependencies.
 */
export const buildDependencies: SectionBuilder<
  ReadmeSectionId,
  ReadmeBuildContext,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> = {
  id: 'dependencies',

  build: (context: ReadmeBuildContext, option?: ConceptOptions) =>
    Effect.gen(function* () {
      const dependencyResult = yield* buildSectionItem(
        'dependencies',
        context,
        ReadmePromptProvider,
        option?.retryOption,
      )
      return {
        section: {
          id: 'dependencies',
          title: undefined,
          contents: [
            {
              type: 'paragraph',
              text: dependencyResult,
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
          sectionId: 'dependencies',
          cause: e,
        })),
      ),
    ),
  translation: { strategy: 'translate', translations: [] },
  enabled: () => true,
}
