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
 * A section builder that generates the 'important-constraints' documentation section for the package.
 */
export const buildImportantConstraints: SectionBuilder<
  LlmContextSectionId,
  LlmContextBuildContext,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> = {
  id: 'important-constraints',

  build: (context: LlmContextBuildContext, option?: ConceptOptions) =>
    Effect.gen(function* () {
      const constraintsResult = yield* buildSectionItem(
        'important-constraints',
        context,
        LlmContextPromptProvider,
        option?.retryOption,
      )
      return {
        section: {
          id: 'important-constraints',
          title: undefined,
          contents: [
            {
              type: 'paragraph',
              text: constraintsResult,
            },
          ],
        } satisfies Section,
      }
    }).pipe(
      Effect.mapError((e) =>
        wrapInfraError(DocumentBuilderError, e, (e) => ({
          filePath: 'Concept.md',
          packageName: context.analysis.package.name,
          phase: 'section-build' as const,
          sectionId: 'important-constraints',
          cause: e,
        })),
      ),
    ),
  translation: { strategy: 'none' },
  enabled: () => true,
}
