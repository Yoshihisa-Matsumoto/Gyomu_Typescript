import { Context, Effect, Layer } from 'effect'
import { loadEnvConfig } from './internal/loadEnvConfig.js'
import { loadStaticConfig } from './internal/loadStaticConfig.js'
import { decodeLoadedConfigs } from './internal/decodeRawLoadedConfig.js'
import { mergeSources } from './internal/mergeSources.js'
import type { ConfigService } from '@gyomu/infra'
import type { ConfigResolutionError } from './errors/ConfigResolutionError.js'
import type { FileSystem, Schema } from 'effect'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { ConfigRequest } from './types/ConfigRequest.js'
import type { ConfigRawConfig } from './types/ConfigRawConfig.js'
import type { RawLoadedConfig } from './types/RawLoadedConfig.js'
import type { ExcludeOption } from './types/ExcludeOption.js'
import type { ConfigRootDirectory } from './services/ConfigRootDirectory.js'

/**
 * Service for resolving application configuration.
 *
 * The resolver combines configuration from multiple scopes and returns a
 * validated, strongly typed result.
 *
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
   * @typeParam ConfigSchema - Target configuration schema.
   * @param schema Schema used to validate and decode the resolved configuration.
   * @param query Configuration resolution criteria.
   *
   * @returns A typed configuration value.
   */
  readonly get: <ConfigSchema extends EffectSchema, RawConfig extends ConfigRawConfig>(
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

export const ConfigResolverLive = Layer.effect(
  ConfigResolver,

  Effect.succeed({
    get: <ConfigSchema extends EffectSchema, RawConfig extends ConfigRawConfig>(
      request: ConfigRequest<ConfigSchema, RawConfig>,
    ) => {
      return Effect.gen(function* () {
        const configs: Array<RawLoadedConfig<RawConfig>> = []
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
            configs.push({
              layer: 'user' as const,
              source: 'runtime' as const,
              values: request.payload as ExcludeOption<RawConfig>,
            })
        }
        if (configs.length == 0) return request.defaultConfig

        const appConfigs = yield* decodeLoadedConfigs(request, configs)
        return mergeSources(request, appConfigs)
      })
    },
  }),
)
