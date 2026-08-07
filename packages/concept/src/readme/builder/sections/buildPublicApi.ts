import { Effect } from 'effect'
import type { ConceptOptions } from '../../../ConceptOptions.js'
import type { SectionBuilder } from '../../../document/builder/SectionBuilder.js'
import type { BulletListItem, Section } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext, ReadmeSectionId } from '@gyomu/schema/concept'

/**
 * Builds the 'public-api' section for the project readme, listing capabilities defined in the project concept.
 */
export const buildPublicApi: SectionBuilder<ReadmeSectionId, ReadmeBuildContext, never> = {
  id: 'public-api',

  build: (context: ReadmeBuildContext, option?: ConceptOptions) => {
    return Effect.succeed({
      section: {
        id: 'public-api',
        title: undefined,
        contents: [
          {
            type: 'bullet-list',
            items: context.concept.capabilities.map(
              (c, index) =>
                ({
                  text: `${c.name} - ${c.description}`,
                  translationId: index,
                }) satisfies BulletListItem,
            ),
          },
        ],
      } satisfies Section,
    })
  },
  translation: { strategy: 'translate', translations: [] },
  enabled: () => true,
}
