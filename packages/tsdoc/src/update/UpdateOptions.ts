import type { AiOptions, AnalysisOptions } from '@gyomu/schema'

export interface UpdateOptions extends AnalysisOptions, AiOptions {
  debugInfo?: AnalysisOptions['debugInfo'] &
    AiOptions['debugInfo'] & {
      JsDocUpdateContext?: boolean
      JsDocUpdatePlan?: boolean
      MergePlan?: boolean
      UpdatedSymbolJsDoc?: boolean
      RenderedSymbolJsDoc?: boolean
      FileUpdatePlan?: boolean
    }
  action?: AnalysisOptions['action'] & {
    NoUpdateTSDoc?: boolean
  }
}
