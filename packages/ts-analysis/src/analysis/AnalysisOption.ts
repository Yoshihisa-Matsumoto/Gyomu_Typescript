export interface AnalysisOptions {
  includeDebugInfo?: boolean
  DumpToFile?: boolean
}

export interface LoadAnalysisOptions extends AnalysisOptions {
  computeMetadataAndTransient?: boolean
  createNewIfNotExistOrInvalid?: boolean
}
