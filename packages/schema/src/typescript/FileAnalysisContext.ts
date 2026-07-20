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

/**
 * Provides a comprehensive context for file analysis, including primary analysis results, metadata, and transient data.
 */
export interface FileAnalysisContext {
  /**
   * The core results of the file analysis.
   */
  analysis: FileAnalysis

  /**
   * Metadata associated with the file analysis, such as parsed JSDoc comments and documented symbols.
   */
  metadata: FileAnalysisMetadata

  /**
   * Transient analysis data, including dependency candidates identified during processing.
   */
  transient: FileAnalysisTransient
}

/**
 * Contains metadata structures for a file analysis, including mapping of parsed JSDoc entries and symbol documentation targets.
 */
export interface FileAnalysisMetadata {
  /**
   * A map of symbol identifiers to their parsed JSDoc documentation.
   */
  parsedJsDocs: Map<SymbolId, ParsedJsDoc>

  /**
   * A map of symbol identifiers to their documentable targets.
   */
  symbols: Map<SymbolId, DocumentableTarget>
}

/**
 * Represents a target within a file that can be documented, holding specific analysis data for the entity.
 */
export interface DocumentableTarget {
  /**
   * The specific analysis type for the documentable target.
   */
  analysis:
    SymbolAnalysis | DocumentableMemberAnalysis | DocumentableTypeProperty | IndexSignatureAnalysis
}

/**
 * Stores transient state for file analysis, specifically caching dependency candidates for symbols.
 */
export interface FileAnalysisTransient {
  /**
   * A map of symbol identifiers to their associated dependency candidates.
   */
  dependencyCandidates: ReadonlyMap<SymbolId, ReadonlyArray<DependencyCandidate>>
}
