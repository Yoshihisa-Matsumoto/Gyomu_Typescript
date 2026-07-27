import type { AiOptions, AnalysisOptions } from '@gyomu/schema'

/**
 * Defines configuration options for the JSDoc update process, extending analysis and AI-related settings with custom debugging and action controls.
 */
export interface UpdateOptions extends AnalysisOptions, AiOptions {
  /**
   * Additional debug information flags for tracing internal processes like JSDoc context generation, planning, and rendering.
   */
  debugInfo?: AnalysisOptions['debugInfo'] &
    AiOptions['debugInfo'] & {
      JsDocUpdateContext?: boolean
      JsDocUpdatePlan?: boolean
      MergePlan?: boolean
      UpdatedSymbolJsDoc?: boolean
      RenderedSymbolJsDoc?: boolean
      FileUpdatePlan?: boolean
    }

  /**
   * Configuration for specific update behaviors, including an optional flag to skip TSDoc updates.
   */
  action?: AnalysisOptions['action'] & {
    NoUpdateTSDoc?: boolean
  }
}
