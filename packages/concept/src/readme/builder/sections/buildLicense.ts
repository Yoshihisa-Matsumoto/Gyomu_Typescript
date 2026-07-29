import { Effect } from 'effect'
import type { Section } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { ReadmeSectionBuilder } from '../ReadmeSectionBuilder.js'

/**
 * A Readme section builder that generates the project's license information.
 */
export const buildLicense: ReadmeSectionBuilder = {
  id: 'license',

  build: (context: ReadmeBuildContext) => {
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
