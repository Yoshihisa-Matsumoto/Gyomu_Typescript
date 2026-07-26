import { overrideMerge } from '../mergeStrategies/overrideMerge.js'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { RawConfigType } from '../types/ConfigRawConfig.js'
import type { ConfigRequest } from '../types/ConfigRequest.js'
import type { AppLoadedConfig } from '../types/AppConfig.js'

/**
 * Merges multiple configuration sources using a specified merge strategy or a default override strategy.
 *
 * @param request The configuration request object containing the default configuration and an optional custom merge strategy.
 *
 * @param appConfigs A list of loaded application configurations to be merged.
 *
 * @returns The final merged configuration object.
 */
export const mergeSources = <ConfigSchema extends EffectSchema, RawConfig extends RawConfigType>(
  request: ConfigRequest<ConfigSchema, RawConfig>,
  appConfigs: ReadonlyArray<AppLoadedConfig<ConfigSchema>>,
) => {
  let merged = request.defaultConfig

  for (const config of appConfigs) {
    merged = request.mergeStrategy?.(merged, config.values) ?? overrideMerge(merged, config.values)
  }
  return merged
}
