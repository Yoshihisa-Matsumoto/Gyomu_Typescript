import { Effect } from 'effect'
import { logger } from '@gyomu/schema'
import { buildConfigPaths } from './staticLoad/buildConfigPaths.js'
import { getConfigRootDiretory } from './staticLoad/getConfigRootDiretory.js'
import { resolveJsonConfig } from './staticLoad/resolveJsonConfig.js'
import type { FileSystem } from 'effect'
import type { ConfigService } from '@gyomu/infra'
import type { EffectSchema } from '@gyomu/schema/entity'

import type { ConfigResolutionError } from '../errors/ConfigResolutionError.js'
import type { ConfigRootDirectory } from '../services/ConfigRootDirectory.js'
import type { ConfigLayer } from '../types/ConfigLayer.js'
import type { ConfigRawConfig } from '../types/ConfigRawConfig.js'
import type { StaticConfigResolveRequest } from '../types/ConfigResolveRequest.js'
import type { RawLoadedConfig } from '../types/RawLoadedConfig.js'

export const loadStaticConfig = <
  ConfigSchema extends EffectSchema,
  RawConfig extends ConfigRawConfig,
>(
  request: StaticConfigResolveRequest<ConfigSchema, RawConfig>,
): Effect.Effect<
  ReadonlyArray<RawLoadedConfig<RawConfig>>,
  ConfigResolutionError,
  ConfigService | FileSystem.FileSystem | ConfigRootDirectory
> =>
  Effect.gen(function* () {
    const configRootDirectory = yield* getConfigRootDiretory(request.query)
    logger.debug({ ConfigRootDirectory: configRootDirectory }, 'ConfigRootDirectory')
    const configPathMap = buildConfigPaths(configRootDirectory, request.query)
    logger.debug(configPathMap, 'buildConfigPaths')
    const loadedConfigs = yield* Effect.forEach(
      Array.from(configPathMap.entries()),
      ([layer, configPath]: readonly [ConfigLayer, string]) =>
        resolveJsonConfig(request, layer, configPath),
    )
    logger.debug(loadedConfigs, 'resolveJsonConfig')
    return loadedConfigs.filter(
      (config): config is RawLoadedConfig<RawConfig> => config !== undefined,
    )
  })
