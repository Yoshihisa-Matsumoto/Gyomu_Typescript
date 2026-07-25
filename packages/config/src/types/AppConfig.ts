import type { ConfigLayer } from './ConfigLayer.js'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { Schema } from 'effect'
import type { ConfigSource } from './ConfigSource.js'

/**
 * Represents the configuration type derived from a provided schema.
 */
export type AppConfig<ConfigSchema extends EffectSchema> = Schema.Schema.Type<ConfigSchema>

/**
 * Represents a partial version of the configuration type derived from the provided schema.
 */
export type PartialAppConfig<ConfigSchema extends EffectSchema> = Partial<AppConfig<ConfigSchema>>

/**
 * Represents a loaded configuration, containing the configuration layer, its source, and the partial configuration values.
 */
export interface AppLoadedConfig<ConfigSchema extends EffectSchema> {
  /**
   * The configuration layer defining this set of values.
   */
  readonly layer: ConfigLayer

  /**
   * The origin source of the configuration.
   */
  readonly source: ConfigSource

  /**
   * The partial configuration values associated with this layer and source.
   */
  readonly values: PartialAppConfig<ConfigSchema>
}
