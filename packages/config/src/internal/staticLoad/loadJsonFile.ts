import { ConfigService } from '@gyomu/infra'
import { withOptional } from '@gyomu/schema'
import { Config, Effect } from 'effect'
import { ConfigResolutionError } from '../../errors/ConfigResolutionError.js'
import { excludeOptionFromRawConfig } from '../excludeOptionFromRawConfig.js'
import { isAllUndefined } from './isAllUndefined.js'
import type { FileSystem } from 'effect'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { ConfigLayer } from '../../types/ConfigLayer.js'
import type { StaticConfigResolveRequest } from '../../types/ConfigResolveRequest.js'
import type { LoadedConfig } from '../../types/LoadedConfig.js'
import type { ConfigRawConfig } from '../../types/ConfigRawConfig.js'

export const loadJsonFile = <ConfigSchema extends EffectSchema, RawConfig extends ConfigRawConfig>(
  request: StaticConfigResolveRequest<ConfigSchema, RawConfig>,
  layer: ConfigLayer,
  settingFilePath: string,
  nestingOption: {
    scope?: string
    function?: string
  },
): Effect.Effect<
  LoadedConfig<RawConfig> | undefined,
  ConfigResolutionError,
  ConfigService | FileSystem.FileSystem
> => {
  let rawConfig = request.rawConfig
  if (nestingOption.function) {
    rawConfig = Config.nested(rawConfig, nestingOption.function)
    if (nestingOption.scope) {
      rawConfig = Config.nested(rawConfig, nestingOption.scope)
    }
  }
  return Effect.gen(function* () {
    const configService = yield* ConfigService

    const dataBlock = yield* configService.load(rawConfig, { file: settingFilePath }).pipe(
      Effect.catchIf(
        (e) => e.phase == 'load',
        () => Effect.succeed(undefined),
      ),
    )

    if (dataBlock == undefined || isAllUndefined(dataBlock)) return undefined

    return {
      layer,
      source: 'file' as const,
      values: excludeOptionFromRawConfig(dataBlock),
    }
  }).pipe(
    Effect.mapError(
      (e) =>
        new ConfigResolutionError({
          cause: e,
          message: `fail to load file`,
          phase: 'config-load',
          retryable: false,
          query: request.query,
          ...withOptional({ details: rawConfig }),
        }),
    ),
  )
}
