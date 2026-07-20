import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import type { Config } from 'effect'
import type { AppErrorContext } from './BaseError.js'

/**
 * Defines the lifecycle phases of a configuration operation.
 */
export type ConfigPhase = 'load' | 'parse' | 'decode' | 'validate'

/**
 * Defines the error context for configuration operations, including the schema, source type, and the lifecycle phase where the error occurred.
 */
export interface ConfigErrorContext extends AppErrorContext {
  /**
   * The configuration schema associated with the error.
   */
  readonly schema?: Config.Config<any>

  /**
   * The source of the configuration, such as environment variables, a file, or a remote location.
   */
  readonly source?: 'env' | 'file' | 'remote'

  /**
   * The specific lifecycle phase in which the error occurred.
   */
  readonly phase: ConfigPhase
}

/**
 * An error class specifically for configuration-related issues, carrying extended context information.
 */
export class ConfigError extends withErrorTraits(
  Data.TaggedError('@gyomu/schema/ConfigError')<ConfigErrorContext>,
) {}
