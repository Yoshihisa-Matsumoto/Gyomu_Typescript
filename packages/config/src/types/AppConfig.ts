import type { ConfigLayer } from './ConfigLayer.js'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { Schema } from 'effect'
import type { ConfigSource } from './ConfigSource.js'

export type AppConfig<ConfigSchema extends EffectSchema> = Schema.Schema.Type<ConfigSchema>
export type PartialAppConfig<ConfigSchema extends EffectSchema> = Partial<AppConfig<ConfigSchema>>

export interface AppLoadedConfig<ConfigSchema extends EffectSchema> {
  readonly layer: ConfigLayer

  readonly source: ConfigSource

  readonly values: PartialAppConfig<ConfigSchema>
}
