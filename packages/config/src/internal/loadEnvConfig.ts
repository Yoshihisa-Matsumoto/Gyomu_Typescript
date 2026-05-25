import { Effect } from 'effect'
import { ConfigService } from '@gyomu/infra'
import { withOptional } from '@gyomu/schema'
import { ConfigResolutionError } from '../errors/ConfigResolutionError.js'
import { excludeOptionFromRawConfig } from './excludeOptionFromRawConfig.js'
import type { ConfigError } from '@gyomu/schema'
import type { FileSystem } from 'effect'
import type { StaticConfigResolveRequest } from '../types/ConfigResolveRequest.js'
import type { LoadedConfig } from '../types/LoadedConfig.js'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { ConfigRawConfig } from '../types/ConfigRawConfig.js'

export const loadEnvConfig = <ConfigSchema extends EffectSchema, RawConfig extends ConfigRawConfig>(
  request: StaticConfigResolveRequest<ConfigSchema, RawConfig>,
): Effect.Effect<
  LoadedConfig<RawConfig> | undefined,
  ConfigResolutionError,
  ConfigService | FileSystem.FileSystem
> =>
  Effect.gen(function* () {
    const configService = yield* ConfigService
    const dataBlock = yield* configService.load(request.rawConfig).pipe(
      Effect.catchIf(
        (e): e is ConfigError => e.phase == 'load',
        () => Effect.succeed(undefined),
      ),
    )

    if (dataBlock == undefined) return undefined

    return {
      layer: 'global' as const,
      source: 'env' as const,
      values: excludeOptionFromRawConfig(dataBlock),
    }
  }).pipe(
    Effect.mapError(
      (e) =>
        new ConfigResolutionError({
          cause: e,
          message: `fail to load env`,
          phase: 'config-load',
          retryable: false,
          query: request.query,
          ...withOptional({ details: request.rawConfig }),
        }),
    ),
  )
