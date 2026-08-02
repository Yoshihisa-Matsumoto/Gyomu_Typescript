import { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { DirectoryAnalysis } from '@gyomu/schema/concept'

export const createDirectoryAnalysis = (
  path: string,
  importance: 'Core' | 'Supporting' | 'Utility',
  publicApiSymbolCount: number,
  rootApiSymbolCount: number,
): DirectoryAnalysis => ({
  path: ProjectRelativePath(path),
  facts: {
    publicApiSymbolCount,
    rootApiSymbolCount,
  },
  concept: {
    summary: '',
    responsibilities: [],
    concepts: [],
    relationships: [],
    designDecisions: [],
    importance,
  },
})
