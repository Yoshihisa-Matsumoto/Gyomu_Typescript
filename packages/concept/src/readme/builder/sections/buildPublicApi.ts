import { Effect } from 'effect'
import type { SectionBuilder } from '../../../document/builder/SectionBuilder.js'
import type { Section } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext, ReadmeSectionId } from '@gyomu/schema/concept'

/**
 * Builds the 'public-api' section for the project readme, listing capabilities defined in the project concept.
 */
export const buildPublicApi: SectionBuilder<ReadmeSectionId, ReadmeBuildContext, never> = {
  id: 'public-api',

  build: (context: ReadmeBuildContext) => {
    return Effect.succeed({
      id: 'public-api',
      title: undefined,
      contents: [
        {
          type: 'bullet-list',
          items: context.concept.capabilities.map((c) => `${c.name} - ${c.description}`),
        },
      ],
    } satisfies Section)
  },
  enabled: () => true,
}
