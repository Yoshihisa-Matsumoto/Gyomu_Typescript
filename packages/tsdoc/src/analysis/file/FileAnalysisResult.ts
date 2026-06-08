import type { ParsedJsDoc } from '../jsdoc/ParsedJsDoc.js'
import type { DocumentableMemberAnalysis } from '../symbol/MemberAnalysis.js'
import type { SymbolAnalysis } from '../symbol/SymbolAnalysis.js'
import type { SymbolId } from '../types.js'
import type { FileAnalysis } from './FileAnalysis.js'

export interface FileAnalysisResult {
  analysis: FileAnalysis
  metadata: FileAnalysisMetadata
}

export interface FileAnalysisMetadata {
  parsedJsDocs: Map<SymbolId, ParsedJsDoc>
  symbols: Map<SymbolId, DocumentableTarget>
}

export interface DocumentableTarget {
  analysis: SymbolAnalysis | DocumentableMemberAnalysis

  indent: string
}
