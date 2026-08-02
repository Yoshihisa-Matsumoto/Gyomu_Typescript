import { Effect } from 'effect'
import { rankDirectoriesByImportance } from '@gyomu/ai-compiler/domain'
import type { SectionBuilder } from '../../../document/builder/SectionBuilder.js'
import type { ConceptOptions } from '../../../ConceptOptions.js'
import type { LlmContextBuildContext, LlmContextSectionId } from '@gyomu/schema/concept'
import type { Section } from '@gyomu/schema/schemas/document'

export const buildRepositoryStructure: SectionBuilder<
  LlmContextSectionId,
  LlmContextBuildContext,
  never
> = {
  id: 'repository-structure',

  build: (context: LlmContextBuildContext, option?: ConceptOptions) => {
    const directoryStructure = rankDirectoriesByImportance(context.analysis.directories).slice(
      0,
      10,
    )
    return Effect.succeed({
      section: {
        id: 'repository-structure',
        title: undefined,
        contents: [
          {
            type: 'table',
            header: { cells: ['Directory', 'Summary'] },
            rows: directoryStructure.map((d) => ({ cells: [d.path, d.concept.summary] })),
          },
        ],
      } satisfies Section,
    })
  },
  enabled: () => true,
}
