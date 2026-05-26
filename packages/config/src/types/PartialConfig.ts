import type { AppConfig } from './AppConfig.js'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { ConfigLayer } from './ConfigLayer.js'
import type { ConfigSource } from './ConfigSource.js'

export interface PartialConfig<ConfigSchema extends EffectSchema> {
  readonly layer: ConfigLayer

  readonly source: ConfigSource

  readonly values: Partial<AppConfig<ConfigSchema>>
}
