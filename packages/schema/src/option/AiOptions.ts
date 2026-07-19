import type { RetryOption } from './RetryOption.js'
import type { ExecutionOptions } from './ExecutionOptions.js'

/**
 * Configuration options for AI execution, extending base execution options with support for retry behavior.
 */
export interface AiOptions extends ExecutionOptions {
  /**
   * Optional configuration for retrying AI operations.
   */
  retryOption?: RetryOption
}
