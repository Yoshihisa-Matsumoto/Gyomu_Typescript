import type { FileAnalysis } from '../schemas/typescript/FileAnalysis.js'
import type {
  DependencyCandidate,
  DocumentableMemberAnalysis,
  DocumentableTypeProperty,
  IndexSignatureAnalysis,
  ParsedJsDoc,
  SymbolAnalysis,
} from '../schemas/typescript/index.js'
import type { SymbolId } from './types.js'

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
  analysis:
    SymbolAnalysis | DocumentableMemberAnalysis | DocumentableTypeProperty | IndexSignatureAnalysis
}

export interface FileAnalysisTransient {
  dependencyCandidates: ReadonlyMap<SymbolId, ReadonlyArray<DependencyCandidate>>
}
