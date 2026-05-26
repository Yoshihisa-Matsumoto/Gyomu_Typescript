import { convertToSchemaObjectWithEffect } from '@gyomu/schema/entity'
import { Effect, Schema, Struct } from 'effect'
import { ConfigResolutionError } from '../errors/ConfigResolutionError.js'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { ConfigRawConfig } from '../types/ConfigRawConfig.js'
import type { ConfigRequest } from '../types/ConfigRequest.js'
import type { RawLoadedConfig } from '../types/RawLoadedConfig.js'
import type { PartialAppConfig } from '../types/AppConfig.js'

export function decodeLoadedConfigs<
  ConfigSchema extends EffectSchema,
  RawConfig extends ConfigRawConfig,
>(
  request: ConfigRequest<ConfigSchema, RawConfig>,
  configs: Array<RawLoadedConfig<RawConfig>>,
): Effect.Effect<ReadonlyArray<PartialAppConfig<ConfigSchema>>, ConfigResolutionError> {
  const partialSchema = request.schema.mapFields(Struct.map(Schema.optional))
  return Effect.forEach(configs, (config) => {
    const result = convertToSchemaObjectWithEffect(
      `${request.query.scope}:${request.query.function}`,
    )(partialSchema, config).pipe(
      Effect.mapError(
        (error) =>
          new ConfigResolutionError({
            cause: error,
            message: `Failed to decode config from ${config.source} at layer ${config.layer}`,
            query: request.query,
            phase: 'config-decode' as const,
            retryable: false,
          }),
      ),
    )
    return result as Effect.Effect<PartialAppConfig<ConfigSchema>, ConfigResolutionError>
  })
}
