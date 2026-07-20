import type { ExecutionOptions } from './ExecutionOptions.js'

/**
 * Defines configuration options for an analysis execution, extending base execution options with support for debug information, metadata computation, and state management.
 */
export interface AnalysisOptions extends ExecutionOptions {
  /**
   * Optional debug configuration, extending base execution debug info with specific keyword and indexing verification settings.
   */
  debugInfo?: ExecutionOptions['debugInfo'] & {
    keyword?: string
    verifyIndex?: boolean
  }

  /**
   * Whether to compute both persistent metadata and transient analysis data.
   */
  computeMetadataAndTransient?: boolean

  /**
   * Determines whether to automatically create a new instance if the existing data is missing or invalid.
   */
  createNewIfNotExistOrInvalid?: boolean
}
