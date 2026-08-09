import type { DirectoryAnalysis } from '@gyomu/schema/concept'
import type { DirectoryFacts } from './DirectoryFacts.js'

/**
 * Analyzes a DirectoryAnalysis object and transforms it into DirectoryFacts.
 *
 * @param directory The directory analysis result to process.
 *
 * @returns A DirectoryFacts object extracted from the analysis.
 */
export const analyzeDirectoryAnalysis = (directory: DirectoryAnalysis): DirectoryFacts => {
  return {
    relativePath: directory.path,
    designDecisions: directory.concept.designDecisions,
    relationships: directory.concept.relationships,
    responsibilities: directory.concept.responsibilities,
  }
}
