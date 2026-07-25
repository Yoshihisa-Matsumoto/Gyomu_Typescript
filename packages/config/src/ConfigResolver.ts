import { Context, Effect, Layer } from 'effect'
import { logger } from '@gyomu/schema'
import { loadEnvConfig } from './internal/loadEnvConfig.js'
import { loadStaticConfig } from './internal/loadStaticConfig.js'
import { decodeRawLoadedConfigs } from './internal/decodeRawLoadedConfig.js'
import { mergeSources } from './internal/mergeSources.js'
import { sortAppLoadedConfigArray } from './internal/layerOrder.js'
import type { AppLoadedConfig } from './types/AppConfig.js'
import type { ConfigService } from '@gyomu/infra'
import type { ConfigResolutionError } from './errors/ConfigResolutionError.js'
import type { FileSystem, Schema } from 'effect'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { ConfigRequest } from './types/ConfigRequest.js'
import type { RawConfigType } from './types/ConfigRawConfig.js'
import type { RawLoadedConfig } from './types/RawLoadedConfig.js'
import type { ConfigRootDirectory } from './services/ConfigRootDirectory.js'

/**
 * Service for resolving application configuration.
 *
 * The resolver combines configuration from multiple scopes and returns a
 * validated, strongly typed result.
 *
 * @remarks
 * Resolution order:
 *
 * ```text
 * Global
 *  ↓
 * User
 *  ↓
 * Scope
 *  ↓
 * UserScope
 * ```
 *
 * Within each level:
 *
 * ```text
 * Group
 *  ↓
 * Function
 * ```
 */
export interface ConfigResolverService {
  /**
   * Resolves configuration matching the specified query.
   *
   * The resulting configuration is validated using the provided schema
   * before being returned.
   *
   * @param request Configuration resolution request containing schema and criteria.
   *
   * @returns An Effect that resolves to a validated configuration, or fails with a ConfigResolutionError.
   *
   * @template ConfigSchema - The schema used for validation.
   *
   * @template RawConfig - The raw configuration type.
   */
  readonly get: <ConfigSchema extends EffectSchema, RawConfig extends RawConfigType>(
    request: ConfigRequest<ConfigSchema, RawConfig>,
  ) => Effect.Effect<
    Schema.Schema.Type<ConfigSchema>,
    ConfigResolutionError,
    ConfigService | FileSystem.FileSystem | ConfigRootDirectory
  >
}

/**
 * Effect service providing configuration resolution.
 *
 * This service is the primary entry point for obtaining configuration
 * within an application.
 */
export class ConfigResolver extends Context.Service<ConfigResolver, ConfigResolverService>()(
  '@gyomu/config/ConfigResolver',
) {}

/**
 * A live implementation of the ConfigResolver service provided as a Layer.
 */
export const ConfigResolverLive = Layer.effect(
  ConfigResolver,

  Effect.succeed({
    get: <ConfigSchema extends EffectSchema, RawConfig extends RawConfigType>(
      request: ConfigRequest<ConfigSchema, RawConfig>,
    ) => {
      return Effect.gen(function* () {
        const configs: Array<RawLoadedConfig<RawConfig>> = []
        logger.debug(request, 'Request')
        let userPayload: AppLoadedConfig<ConfigSchema> | undefined = undefined
        if (request.resolutionMode != 'runtime') {
          if (request.resolutionMode == 'env') {
            const result = yield* loadEnvConfig(request)
            if (result) configs.push(result)
          } else {
            const fileConfigs = yield* loadStaticConfig(request)
            configs.push(...fileConfigs)
          }
        }
        if (request.resolutionMode == 'runtime' || request.resolutionMode == 'mixed') {
          if (request.payload)
            userPayload = {
              layer: 'user' as const,
              source: 'runtime' as const,
              values: request.payload,
            }
        }
        logger.debug(configs, 'loadStaticConfig')
        if (configs.length == 0 && !request.payload) return request.defaultConfig

        const appConfigs = yield* decodeRawLoadedConfigs(request, configs)
        logger.debug(appConfigs, 'App Configs')
        const sortedAppConfigs = sortAppLoadedConfigArray(appConfigs)
        if (userPayload) sortedAppConfigs.push(userPayload)
        logger.debug(sortedAppConfigs, 'Sorted App Configs')
        return mergeSources(request, sortedAppConfigs)
      })
    },
  }),
)
