import { Effect } from 'effect'
import type { Section } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { ReadmeSectionBuilder } from '../ReadmeSectionBuilder.js'

export const buildInstallation: ReadmeSectionBuilder = {
  id: 'installation',

  build: (context: ReadmeBuildContext) => {
    return Effect.succeed({
      id: 'installation',
      title: undefined,
      contents: [
        {
          type: 'paragraph',
          text: 'Install using pnpm.',
        },

        {
          type: 'code',
          language: 'bash',

          code: `pnpm add ${context.analysis.package.name}`,
        },
      ],
    } satisfies Section)
  },
  enabled: () => true,
}
