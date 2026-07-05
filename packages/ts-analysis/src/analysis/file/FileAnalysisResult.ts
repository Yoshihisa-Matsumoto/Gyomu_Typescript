import type {
  DocumentableMemberAnalysis,
  DocumentableTypeProperty,
  SymbolAnalysis,
  SymbolId,
} from '@gyomu/schema/typescript'

import type { FileAnalysis } from './FileAnalysis.js'
import type { DependencyCandidate, ParsedJsDoc } from '@gyomu/schema/schemas/typescript'

export interface FileAnalysisResult {
  analysis: FileAnalysis
  metadata: FileAnalysisMetadata
  transient: FileAnalysisTransient
}

export interface FileAnalysisMetadata {
  parsedJsDocs: Map<string, ParsedJsDoc>
  symbols: Map<SymbolId, DocumentableTarget>
}

export interface DocumentableTarget {
  analysis: SymbolAnalysis | DocumentableMemberAnalysis | DocumentableTypeProperty

  indent: string
}

export interface FileAnalysisTransient {
  dependencyCandidates: ReadonlyMap<SymbolId, ReadonlyArray<DependencyCandidate>>
}
