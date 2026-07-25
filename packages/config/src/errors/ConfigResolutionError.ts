import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { ConfigQuery } from '../ConfigQuery.js'
import type { AppErrorContext } from '@gyomu/schema'

/**
 * Represents the specific stage in the configuration resolution lifecycle.
 */
export type ConfigResolutionPhase =
  | 'path-resolve'
  | 'config-load'
  | 'config-decode'
  | 'config-merge'
  | 'group-resolve'
  | 'function-resolve'
  | 'validation'

/**
 * Defines the context for errors encountered during the configuration resolution process, including the query, phase, and retryability.
 */
export interface ConfigResolutionErrorContext extends AppErrorContext {
  /**
   * Resolution scope used to locate applicable configuration layers
   * such as user, scope, group, and function settings.
   */
  readonly query: ConfigQuery

  /**
   * The specific resolution phase where the error occurred.
   */
  readonly phase: ConfigResolutionPhase

  /**
   * Whether retrying may succeed.
   */
  readonly retryable: boolean
}

/**
 * An error thrown when a configuration resolution failure occurs.
 */
export class ConfigResolutionError extends withErrorTraits(
  Data.TaggedError('ConfigResolutionError')<ConfigResolutionErrorContext>,
  {
    isRetryable: (ctx) => ctx.retryable,
  },
) {}
