import type { RawConfigType } from './ConfigRawConfig.js'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { ConfigRequest, StaticConfigRequest } from './ConfigRequest.js'

/**
 * Represents a configuration resolution request subset, including the raw configuration and query parameters.
 */
export type ConfigResolveRequest<
  ConfigSchema extends EffectSchema,
  RawConfig extends RawConfigType,
> = Pick<ConfigRequest<ConfigSchema, RawConfig>, 'rawConfig' | 'query'>

/**
 * Represents a static configuration resolution request subset, including the raw configuration and query parameters.
 */
export type StaticConfigResolveRequest<
  ConfigSchema extends EffectSchema,
  RawConfig extends RawConfigType,
> = Pick<StaticConfigRequest<ConfigSchema, RawConfig>, 'rawConfig' | 'query'>
