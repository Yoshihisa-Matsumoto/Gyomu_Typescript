import type { ConfigLayer } from './ConfigLayer.js'
import type { ConfigRawConfig, RawConfigType } from './ConfigRawConfig.js'
import type { ConfigSource } from './ConfigSource.js'
import type { ExcludeOption } from './ExcludeOption.js'

/**
 * Represents a configuration object after it has been loaded, including metadata about its origin layer and source.
 */
export interface RawLoadedConfig<RawConfig extends RawConfigType> {
  /**
   * The configuration layer defining the priority or context of these values.
   */
  readonly layer: ConfigLayer

  /**
   * The source identification for where the configuration originated.
   */
  readonly source: ConfigSource

  /**
   * The processed configuration values.
   */
  readonly values: ExcludeOption<ConfigRawConfig<RawConfig>>
}
