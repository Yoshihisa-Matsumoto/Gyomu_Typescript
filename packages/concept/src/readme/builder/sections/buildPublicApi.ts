import { Effect } from 'effect'
import type { Section } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { ReadmeSectionBuilder } from '../ReadmeSectionBuilder.js'

export const buildPublicApi: ReadmeSectionBuilder = {
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
