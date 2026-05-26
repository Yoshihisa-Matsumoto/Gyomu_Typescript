import type { ConfigLayer } from './ConfigLayer.js'
import type { ConfigRawConfig, RawConfigType } from './ConfigRawConfig.js'
import type { ConfigSource } from './ConfigSource.js'
import type { ExcludeOption } from './ExcludeOption.js'

export interface RawLoadedConfig<RawConfig extends RawConfigType> {
  readonly layer: ConfigLayer

  readonly source: ConfigSource

  readonly values: ExcludeOption<ConfigRawConfig<RawConfig>>
}
