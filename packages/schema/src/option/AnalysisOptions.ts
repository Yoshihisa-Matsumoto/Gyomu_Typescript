import type { ExecutionOptions } from './ExecutionOptions.js'

export interface AnalysisOptions extends ExecutionOptions {
  debugInfo?: ExecutionOptions['debugInfo'] & {
    keyword?: string
    verifyIndex?: boolean
  }

  computeMetadataAndTransient?: boolean
  createNewIfNotExistOrInvalid?: boolean
}
