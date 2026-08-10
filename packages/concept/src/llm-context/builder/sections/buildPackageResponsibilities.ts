import { Effect } from 'effect'
import type { SectionBuilder } from '../../../document/builder/SectionBuilder.js'
import type { ConceptOptions } from '../../../ConceptOptions.js'
import type { LlmContextBuildContext, LlmContextSectionId } from '@gyomu/schema/concept'
import type { Section } from '@gyomu/schema/schemas/document'

/**
 * Defines a section builder for package responsibilities, converting concept responsibilities into a bulleted list for the LLM context.
 */
export const buildPackageResponsibilities: SectionBuilder<
  LlmContextSectionId,
  LlmContextBuildContext,
  never
> = {
  id: 'package-responsibilities',

  build: (context: LlmContextBuildContext, option?: ConceptOptions) => {
    return Effect.succeed({
      section: {
        id: 'package-responsibilities',
        title: undefined,
        contents: [
          {
            type: 'bullet-list',
            items: context.concept.responsibilities.map((responsibility, index) => ({
              type: 'text',
              text: responsibility,
              translationId: index,
            })),
          },
        ],
      } satisfies Section,
    })
  },
  translation: { strategy: 'none' },
  enabled: () => true,
}
