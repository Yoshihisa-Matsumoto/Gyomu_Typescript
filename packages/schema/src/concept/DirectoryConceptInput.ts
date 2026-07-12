import type { DirectoryRelativePath } from '../typescript/types.js'
import type { DirectoryConcept } from '../schemas/concept/DirectoryConcept.js'
import type { FileSummary } from './FileSummary.js'

export interface DirectoryConceptInput {
  files: Array<FileSummary>
  subDirectories: Array<{ path: DirectoryRelativePath; concept: DirectoryConcept }>
}
