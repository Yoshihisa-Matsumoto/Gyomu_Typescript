import { convertToSchemaObjectWithEffect } from '@gyomu/schema/entity'
import { Effect, Schema, Struct } from 'effect'
import { logger } from '@gyomu/schema'
import { ConfigResolutionError } from '../errors/ConfigResolutionError.js'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { RawConfigType } from '../types/ConfigRawConfig.js'
import type { ConfigRequest } from '../types/ConfigRequest.js'
import type { RawLoadedConfig } from '../types/RawLoadedConfig.js'
import type { AppLoadedConfig } from '../types/AppConfig.js'

/**
 * Decodes an array of raw loaded configurations using the provided schema request.
 *
 * @param request The configuration request containing the schema and query information.
 *
 * @param configs The list of raw configurations to decode.
 *
 * @returns An Effect that resolves to the array of decoded configurations or fails with a ConfigResolutionError.
 */
export function decodeRawLoadedConfigs<
  ConfigSchema extends EffectSchema,
  RawConfig extends RawConfigType,
>(
  request: ConfigRequest<ConfigSchema, RawConfig>,
  configs: Array<RawLoadedConfig<RawConfig>>,
): Effect.Effect<Array<AppLoadedConfig<ConfigSchema>>, ConfigResolutionError> {
  const partialSchema = request.schema.mapFields(Struct.map(Schema.optional))
  logger.debug(partialSchema, 'decode target schema')
  logger.debug(configs, 'Config Array')
  return Effect.forEach(configs, (config) => {
    const result = convertToSchemaObjectWithEffect(
      `${request.query.scope}:${request.query.function}`,
    )(partialSchema, config.values).pipe(
      Effect.map((decodedConfig) => ({
        layer: config.layer,
        source: config.source,
        values: decodedConfig,
      })),
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
    return result as Effect.Effect<AppLoadedConfig<ConfigSchema>, ConfigResolutionError>
  })
}
