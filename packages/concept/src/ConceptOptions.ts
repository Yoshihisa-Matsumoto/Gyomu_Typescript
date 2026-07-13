import type { RetryOption } from '@gyomu/ai'

export interface ConceptOptions {
  debugInfo?:
    | {
        DirectoryConcept?: boolean
        FileSummaryInput?: boolean
        DumpToFile?: boolean
      }
    | undefined
  action?:
    | {
        NoLLMRequest?: boolean
        NoUpdateTSDoc?: boolean
        WriteToTempFolder?: boolean
      }
    | undefined
  retryOption: RetryOption | undefined
}
