import { Effect } from 'effect'
import { buildSectionItem } from '@gyomu/ai-compiler/document'
import { wrapInfraError } from '@gyomu/schema'
import { LlmContextPromptProvider } from '@gyomu/ai-compiler/llm-context'
import { DocumentBuilderError } from '../../../error/DocumentBuilderError.js'
import type { SectionBuilder } from '../../../document/builder/SectionBuilder.js'
import type { FileSystem } from 'effect'
import type { Section } from '@gyomu/schema/schemas/document'
import type { LlmContextBuildContext, LlmContextSectionId } from '@gyomu/schema/concept'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { ConceptOptions } from '../../../ConceptOptions.js'

/**
 * A README section builder that generates the overview content based on the project's analysis context.
 */
export const buildOverview: SectionBuilder<
  LlmContextSectionId,
  LlmContextBuildContext,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> = {
  id: 'overview',

  build: (context: LlmContextBuildContext, option?: ConceptOptions) =>
    Effect.gen(function* () {
      const overviewResult = yield* buildSectionItem(
        'overview',
        context,
        LlmContextPromptProvider,
        option?.retryOption,
      )
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
