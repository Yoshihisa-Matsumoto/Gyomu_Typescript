import { Effect } from 'effect'
import type { Section } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { ReadmeSectionBuilder } from '../ReadmeSectionBuilder.js'

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
