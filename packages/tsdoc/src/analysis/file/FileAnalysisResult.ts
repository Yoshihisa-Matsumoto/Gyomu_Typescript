import type {
  DependencyCandidate,
  DocumentableMemberAnalysis,
  ParsedJsDoc,
  SymbolAnalysis,
  SymbolId,
} from '@gyomu/schema/typescript'

import type { FileAnalysis } from './FileAnalysis.js'

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
  dependencyCandidates: ReadonlyMap<SymbolId, ReadonlyArray<DependencyCandidate>>
}
