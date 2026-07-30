import { Effect } from 'effect'
import type { ConceptOptions } from '../../../ConceptOptions.js'
import type { SectionBuilder } from '../../../document/builder/SectionBuilder.js'
import type { Section } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext, ReadmeSectionId } from '@gyomu/schema/concept'

/**
 * A Readme section builder that generates the project's license information.
 */
export const buildLicense: SectionBuilder<ReadmeSectionId, ReadmeBuildContext, never> = {
  id: 'license',

  build: (context: ReadmeBuildContext, option?: ConceptOptions) => {
    return Effect.succeed({
      id: 'license',
      title: undefined,
      contents: [
        {
          type: 'paragraph',
          text: context.analysis.package.license,
        },
      ],
    } satisfies Section)
  },

  enabled: () => true,
}
