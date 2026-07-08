import type { SymbolId } from '@gyomu/schema/typescript'

import type { FileAnalysis } from './FileAnalysis.js'
import type {
  DependencyCandidate,
  DocumentableMemberAnalysis,
  DocumentableTypeProperty,
  ParsedJsDoc,
  SymbolAnalysis,
} from '@gyomu/schema/schemas/typescript'

export interface FileAnalysisContext {
  analysis: FileAnalysis
  metadata: FileAnalysisMetadata
  transient: FileAnalysisTransient
}

export interface FileAnalysisMetadata {
  parsedJsDocs: Map<SymbolId, ParsedJsDoc>
  symbols: Map<SymbolId, DocumentableTarget>
}

export interface DocumentableTarget {
  analysis: SymbolAnalysis | DocumentableMemberAnalysis | DocumentableTypeProperty
}

export interface FileAnalysisTransient {
  dependencyCandidates: ReadonlyMap<SymbolId, ReadonlyArray<DependencyCandidate>>
}
