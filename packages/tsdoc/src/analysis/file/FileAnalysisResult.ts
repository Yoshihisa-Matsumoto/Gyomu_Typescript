import type { ParsedJsDoc } from '../jsdoc/ParsedJsDoc.js'
import type { SymbolId } from '../types.js'
import type { FileAnalysis } from './FileAnalysis.js'

export interface FileAnalysisResult {
  analysis: FileAnalysis
  metadata: FileAnalysisMetadata
}

export interface FileAnalysisMetadata {
  parsedJsDocs: Map<SymbolId, ParsedJsDoc>
}
