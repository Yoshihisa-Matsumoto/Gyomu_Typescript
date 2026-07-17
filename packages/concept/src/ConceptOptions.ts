import type { AiOptions, AnalysisOptions } from '@gyomu/schema'

export interface ConceptOptions extends AnalysisOptions, AiOptions {
  debugInfo?: AnalysisOptions['debugInfo'] &
    AiOptions['debugInfo'] & {
      DirectoryConcept?: boolean
    }
}
