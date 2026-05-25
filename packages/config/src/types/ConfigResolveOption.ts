import type { ConfigResolutionStrategy } from './ConfigResolutionStrategy.js'

export type ConfigViolationMode = 'ignore' | 'adjust' | 'reject'
export interface ConfigResolveOptions {
  readonly payload?: Record<string, unknown>

  readonly strategy?: ConfigResolutionStrategy

  readonly violationMode?: ConfigViolationMode
}
