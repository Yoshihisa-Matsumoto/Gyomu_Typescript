import type { DirectoryRelativePath } from '../typescript/types.js'
import type { DirectoryConcept } from '../schemas/concept/DirectoryConcept.js'
import type { FileSummary } from './FileSummary.js'

/**
 * Represents the input structure for a directory concept, containing a list of files and nested subdirectories.
 */
export interface DirectoryConceptInput {
  /**
   * The collection of files present in this directory.
   */
  files: Array<FileSummary>

  /**
   * The collection of nested subdirectories, each associated with a path and a concept.
   */
  subDirectories: Array<{ path: DirectoryRelativePath; concept: DirectoryConcept }>
}
