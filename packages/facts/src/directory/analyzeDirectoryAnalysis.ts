import type { DirectoryAnalysis } from '@gyomu/schema/concept'
import type { DirectoryFacts } from './DirectoryFacts.js'

export const analyzeDirectoryAnalysis = (directory: DirectoryAnalysis): DirectoryFacts => {
  return {
    relativePath: directory.path,
    designDecisions: directory.concept.designDecisions,
    relationships: directory.concept.relationships,
    responsibilities: directory.concept.responsibilities,
  }
}
