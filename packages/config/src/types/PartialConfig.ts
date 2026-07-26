import type { AppConfig } from './AppConfig.js'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { ConfigLayer } from './ConfigLayer.js'
import type { ConfigSource } from './ConfigSource.js'

/**
 * Represents a partial configuration object for a specific schema, containing the configuration layer, source, and the partial values.
 */
export interface PartialConfig<ConfigSchema extends EffectSchema> {
  /**
   * The configuration layer defining the priority or context of this configuration set.
   */
  readonly layer: ConfigLayer

  /**
   * The origin or source identifier for this configuration data.
   */
  readonly source: ConfigSource

  /**
   * The partial configuration values mapping to the associated schema.
   */
  readonly values: Partial<AppConfig<ConfigSchema>>
}
