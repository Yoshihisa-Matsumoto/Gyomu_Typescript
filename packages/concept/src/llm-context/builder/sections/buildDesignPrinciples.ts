import { Effect } from 'effect'
import { wrapInfraError } from '@gyomu/schema'
import { LlmContextPromptProvider } from '@gyomu/ai-compiler/llm-context'
import { DocumentBuilderError } from '../../../error/DocumentBuilderError.js'
import { buildBulletList } from '../../../document/builder/buildBulletList.js'
import type { Section } from '@gyomu/schema/schemas/document'
import type { ConceptOptions } from '../../../ConceptOptions.js'
import type { SectionBuilder } from '../../../document/builder/SectionBuilder.js'
import type { FileSystem } from 'effect'
import type { LlmContextBuildContext, LlmContextSectionId } from '@gyomu/schema/concept'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'

/**
 * A readme section builder that generates the 'design-principles' section for the package documentation.
 */
export const buildDesignPrinciples: SectionBuilder<
  LlmContextSectionId,
  LlmContextBuildContext,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> = {
  id: 'design-principles',

  build: (context: LlmContextBuildContext, option?: ConceptOptions) =>
    Effect.gen(function* () {
      const editingRuleResult = yield* buildBulletList(
        'design-principles',
        context,
        LlmContextPromptProvider,
        option?.retryOption,
      )
      return {
        section: {
          id: 'design-principles',
          title: undefined,
          contents: [editingRuleResult],
        } satisfies Section,
      }
    }).pipe(
      Effect.mapError((e) =>
        wrapInfraError(DocumentBuilderError, e, (e) => ({
          filePath: 'Concept.md',
          packageName: context.analysis.package.name,
          phase: 'section-build' as const,
          sectionId: 'design-principles',
          cause: e,
        })),
      ),
    ),
  translation: { strategy: 'none' },
  enabled: () => true,
}
