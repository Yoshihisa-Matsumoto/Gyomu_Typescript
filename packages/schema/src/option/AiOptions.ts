import type { RetryOption } from './RetryOption.js'
import type { ExecutionOptions } from './ExecutionOptions.js'

export interface AiOptions extends ExecutionOptions {
  retryOption?: RetryOption
}
