import type {
  DocumentableMemberAnalysis,
  ParsedJsDoc,
  SymbolAnalysis,
  SymbolId,
} from '@gyomu/schema/typescript'

import type { FileAnalysis } from './FileAnalysis.js'
import type { DependencyRequirement } from '../graph/DependencyRequirement.js'

export interface FileAnalysisResult {
  analysis: FileAnalysis
  metadata: FileAnalysisMetadata
  transient: FileAnalysisTransient
}

export interface FileAnalysisMetadata {
  parsedJsDocs: Map<SymbolId, ParsedJsDoc>
  symbols: Map<SymbolId, DocumentableTarget>
}

export interface DocumentableTarget {
  analysis: SymbolAnalysis | DocumentableMemberAnalysis

  indent: string
}

export interface FileAnalysisTransient {
  dependencyRequirements: ReadonlyMap<SymbolId, ReadonlyArray<DependencyRequirement>>
}
