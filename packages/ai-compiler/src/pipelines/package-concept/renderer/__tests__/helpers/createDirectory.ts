import { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { DeepPartial } from '@gyomu/schema'
import type { DirectoryAnalysis } from '@gyomu/schema/concept'

export const createDirectory = (
  overrides: DeepPartial<DirectoryAnalysis> = {},
): DirectoryAnalysis => ({
  path: overrides.path ? ProjectRelativePath(overrides.path as string) : ProjectRelativePath('src'),

  concept: {
    importance: overrides.concept?.importance ?? 'Supporting',
    summary: overrides.concept?.summary ?? 'summary',
    relationships: overrides.concept?.relationships ?? [],
    concepts: overrides.concept?.concepts ?? [],
    designDecisions: overrides.concept?.designDecisions ?? [],
    responsibilities: overrides.concept?.responsibilities ?? [],
  },

  facts: {
    publicApiSymbolCount: overrides.facts?.publicApiSymbolCount ?? 0,
    rootApiSymbolCount: overrides.facts?.rootApiSymbolCount ?? 0,
  },
})
