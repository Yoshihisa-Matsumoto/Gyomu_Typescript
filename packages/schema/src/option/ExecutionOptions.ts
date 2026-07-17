export interface ExecutionOptions {
  metadataRoot?: string

  debugInfo?: {
    DumpToFile?: boolean
  }

  action?: {
    noLLMRequest?: boolean
    WriteToTempFolder?: boolean
  }
}
