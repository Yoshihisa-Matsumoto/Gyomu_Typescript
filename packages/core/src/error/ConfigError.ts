import { Data } from 'effect';
import { AppErrorContext, withErrorTraits } from './BaseError.js';

export type ConfigPhase = 'load' | 'parse' | 'decode' | 'validate';

export interface ConfigErrorContext extends AppErrorContext {
  readonly key?: string; // 例: "DB_HOST"
  readonly source?: 'env' | 'file' | 'remote';
  readonly phase: ConfigPhase;
}
export class ConfigError extends withErrorTraits(
  Data.TaggedError('ConfigError')<ConfigErrorContext>,
) {}
