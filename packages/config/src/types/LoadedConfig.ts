import type { ConfigLayer } from './ConfigLayer.js'
import type { ConfigRawConfig } from './ConfigRawConfig.js'
import type { ConfigSource } from './ConfigSource.js'
import type { ExcludeOption } from './ExcludeOption.js'

export interface LoadedConfig<RawConfig extends ConfigRawConfig> {
  readonly layer: ConfigLayer

  readonly source: ConfigSource

  readonly values: ExcludeOption<RawConfig>
}
