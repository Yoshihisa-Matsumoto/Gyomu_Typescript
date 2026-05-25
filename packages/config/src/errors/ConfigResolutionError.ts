import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { ConfigQuery } from '../ConfigQuery.js'
import type { AppErrorContext } from '@gyomu/schema'

export type ConfigResolutionPhase =
  | 'path-resolve'
  | 'config-load'
  | 'config-merge'
  | 'group-resolve'
  | 'function-resolve'
  | 'validation'

export interface ConfigResolutionErrorContext extends AppErrorContext {
  /**
   * Resolution scope used to locate applicable configuration layers
   * such as user, scope, group, and function settings.
   */
  readonly query: ConfigQuery

  /**
   * Resolution phase.
   */
  readonly phase: ConfigResolutionPhase

  /**
   * Whether retrying may succeed.
   */
  readonly retryable: boolean
}

export class ConfigResolutionError extends withErrorTraits(
  Data.TaggedError('ConfigResolutionError')<ConfigResolutionErrorContext>,
  {
    isRetryable: (ctx) => ctx.retryable,
  },
) {}
