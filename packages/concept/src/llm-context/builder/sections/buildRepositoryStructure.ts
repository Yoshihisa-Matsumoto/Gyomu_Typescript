import { Effect } from 'effect'
import { analyzePackageAnalysis } from '@gyomu/facts'
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
    const packageFact = analyzePackageAnalysis(context.analysis)
    const directoryStructure = packageFact.getRankedDirectories({
      strategy: 'top-score',
      limit: 10,
    })
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
