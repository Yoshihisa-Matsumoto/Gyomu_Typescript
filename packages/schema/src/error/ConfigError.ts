import { Data } from 'effect'
import { withErrorTraits } from './BaseError.js'
import type { Config } from 'effect'
import type { AppErrorContext } from './BaseError.js'

export type ConfigPhase = 'load' | 'parse' | 'decode' | 'validate'

export interface ConfigErrorContext extends AppErrorContext {
  readonly schema?: Config.Config<any>
  readonly source?: 'env' | 'file' | 'remote'
  readonly phase: ConfigPhase
}
export class ConfigError extends withErrorTraits(
  Data.TaggedError('@gyomu/schema/ConfigError')<ConfigErrorContext>,
) {}
