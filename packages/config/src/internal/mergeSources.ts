import { overrideMerge } from '../mergeStrategies/overrideMerge.js'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { ConfigRawConfig } from '../types/ConfigRawConfig.js'
import type { ConfigRequest } from '../types/ConfigRequest.js'
import type { PartialAppConfig } from '../types/AppConfig.js'

export const mergeSources = <ConfigSchema extends EffectSchema, RawConfig extends ConfigRawConfig>(
  request: ConfigRequest<ConfigSchema, RawConfig>,
  appConfigs: ReadonlyArray<PartialAppConfig<ConfigSchema>>,
) => {
  let merged = request.defaultConfig

  for (const config of appConfigs) {
    merged = request.mergeStrategy?.(merged, config) ?? overrideMerge(merged, config)
  }
  return merged
}
