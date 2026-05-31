import { logger, withOptional } from '@gyomu/schema'
import { Effect, FileSystem } from 'effect'
import { ConfigResolutionError } from '../../errors/ConfigResolutionError.js'
import { loadJsonFile } from './loadJsonFile.js'
import type { RawConfigType } from '../../types/ConfigRawConfig.js'
import type { ConfigService } from '@gyomu/infra'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { ConfigLayer } from '../../types/ConfigLayer.js'
import type { StaticConfigResolveRequest } from '../../types/ConfigResolveRequest.js'
import type { RawLoadedConfig } from '../../types/RawLoadedConfig.js'

/**
 * Resolves a configuration section from a JSON settings file.
 *
 * Lookup order:
 *
 * | Layer         | Search sequence |
 * |---------------|-----------------|
 * | global        | scope/function → function |
 * | user          | scope/function → function |
 * | scope         | function → root |
 * | user-scope    | function → root |
 *
 * The first matching configuration is returned.
 * Missing files or unmatched lookups result in `undefined`.
 *
 * @typeParam ConfigSchema - Configuration schema.
 * @typeParam RawConfig - Raw configuration type.
 * @param request - Resolution request.
 * @param layer - Layer that defines the lookup hierarchy.
 * @param settingFilePath - JSON settings file path.
 * @returns Resolved configuration or `undefined`.
 * @throws ConfigResolutionError When file access or loading fails.
 */
export const resolveJsonConfig = <
  ConfigSchema extends EffectSchema,
  RawConfig extends RawConfigType,
>(
  request: StaticConfigResolveRequest<ConfigSchema, RawConfig>,
  layer: ConfigLayer,
  settingFilePath: string,
): Effect.Effect<
  RawLoadedConfig<RawConfig> | undefined,
  ConfigResolutionError,
  ConfigService | FileSystem.FileSystem
> => {
  return Effect.gen(function* () {
    const fileSystem = yield* FileSystem.FileSystem
    const settingFileExists = yield* fileSystem.exists(settingFilePath).pipe(
      Effect.mapError(
        (e) =>
          new ConfigResolutionError({
            cause: e,
            message: `fail to check file existence`,
            phase: 'config-load',
            retryable: false,
            query: request.query,
            ...withOptional({ details: settingFilePath }),
          }),
      ),
    )
    if (!settingFileExists) return undefined
    const { scope: scope, function: functionName } = request.query
    let loadedConfig: RawLoadedConfig<RawConfig> | undefined
    switch (layer) {
      case 'global':
      case 'user':
        // Nest with FunctionGroup + Function
        if (functionName && scope) {
          loadedConfig = yield* loadJsonFile(request, layer, settingFilePath, {
            scope,
            function: functionName,
          })
          if (loadedConfig) logger.debug(loadedConfig, 'load Global/User with scope+function')
          if (loadedConfig) return loadedConfig
        }

        // If not found, nest with Function
        if (functionName) {
          return yield* loadJsonFile(request, layer, settingFilePath, { function: functionName })
        }
        return undefined
      case 'scope':
      case 'user-scope':
        // Nest with Function
        if (functionName) {
          loadedConfig = yield* loadJsonFile(request, layer, settingFilePath, {
            function: functionName,
          })
          if (loadedConfig) return loadedConfig
        }
        // If not found, without nesting
        return yield* loadJsonFile(request, layer, settingFilePath, {})
    }
  })
}
