export interface AnalysisOptions {
  includeDebugInfo?: {
    keyword: string
  }
  DumpToFile?: boolean
}

export interface LoadAnalysisOptions extends AnalysisOptions {
  computeMetadataAndTransient?: boolean
  createNewIfNotExistOrInvalid?: boolean
}
