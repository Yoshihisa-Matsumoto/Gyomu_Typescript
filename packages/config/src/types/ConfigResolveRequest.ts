import type { ConfigRawConfig } from './ConfigRawConfig.js'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { ConfigRequest, StaticConfigRequest } from './ConfigRequest.js'

export type ConfigResolveRequest<
  ConfigSchema extends EffectSchema,
  RawConfig extends ConfigRawConfig,
> = Pick<ConfigRequest<ConfigSchema, RawConfig>, 'rawConfig' | 'query'>

export type StaticConfigResolveRequest<
  ConfigSchema extends EffectSchema,
  RawConfig extends ConfigRawConfig,
> = Pick<StaticConfigRequest<ConfigSchema, RawConfig>, 'rawConfig' | 'query'>
