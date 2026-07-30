import { Effect } from 'effect'
import { buildSectionItem } from '@gyomu/ai-compiler/document'
import { wrapInfraError } from '@gyomu/schema'
import { LlmContextPromptProvider } from '@gyomu/ai-compiler/llm-context'
import { DocumentBuilderError } from '../../../error/DocumentBuilderError.js'
import type { ConceptOptions } from '../../../ConceptOptions.js'
import type { SectionBuilder } from '../../../document/builder/SectionBuilder.js'
import type { FileSystem } from 'effect'
import type { Section } from '@gyomu/schema/schemas/document'
import type { LlmContextBuildContext, LlmContextSectionId } from '@gyomu/schema/concept'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'

/**
 * A readme section builder that generates the 'architecture' section for the package documentation.
 */
export const buildArchitecture: SectionBuilder<
  LlmContextSectionId,
  LlmContextBuildContext,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> = {
  id: 'architecture',

  build: (context: LlmContextBuildContext, option?: ConceptOptions) =>
    Effect.gen(function* () {
      const overviewResult = yield* buildSectionItem(
        'architecture',
        context,
        LlmContextPromptProvider,
        option?.retryOption,
      )
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
