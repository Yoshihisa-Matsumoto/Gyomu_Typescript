import { Effect } from 'effect'
import type { ConceptOptions } from '../../../ConceptOptions.js'
import type { SectionBuilder } from '../../../document/builder/SectionBuilder.js'
import type { Section } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext, ReadmeSectionId } from '@gyomu/schema/concept'

/**
 * Constructs the installation section for the readme.
 */
export const buildInstallation: SectionBuilder<ReadmeSectionId, ReadmeBuildContext, never> = {
  id: 'installation',

  build: (context: ReadmeBuildContext, option?: ConceptOptions) => {
    return Effect.succeed({
      section: {
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
      } satisfies Section,
    })
  },
  enabled: () => true,
}
