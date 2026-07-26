import type { EffectSchema } from '@gyomu/schema/entity'
import type { AppLoadedConfig } from '../types/AppConfig.js'
import type { ConfigLayer } from '../types/ConfigLayer.js'
import type { ConfigSource } from '../types/ConfigSource.js'

const layerOrder: Record<ConfigLayer, number> = {
  global: 0,
  user: 1,
  scope: 2,
  'user-scope': 3,
}

/**
 * Sorts an array of loaded application configurations based on source and layer order.
 *
 * @param appConfigs The array of application configurations to sort.
 *
 * @returns A new sorted array of configurations.
 */
export const sortAppLoadedConfigArray = <ConfigSchema extends EffectSchema>(
  appConfigs: Array<AppLoadedConfig<ConfigSchema>>,
) =>
  [...appConfigs].sort((a, b) => {
    const sourceRank = (source: ConfigSource) => (source === 'runtime' ? 1 : 0)

    const sourceDiff = sourceRank(a.source) - sourceRank(b.source)

    if (sourceDiff !== 0) {
      return sourceDiff
    }

    return layerOrder[a.layer] - layerOrder[b.layer]
  })
