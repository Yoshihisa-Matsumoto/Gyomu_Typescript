import type { ExtractConfig, NormalizeOptionObject } from '@gyomu/schema'
import type { Config } from 'effect'

/**
 * Defines the base raw configuration structure using a record of unknown values.
 */
export type RawConfigType = Config.Config<Record<string, unknown>>

/**
 * Extracts and normalizes the configuration structure from the provided raw configuration type.
 *
 * @param ConfigType The raw configuration type to normalize and extract.
 *
 * @template ConfigType
 */
export type ConfigRawConfig<ConfigType extends RawConfigType> = ExtractConfig<
  NormalizeOptionObject<ConfigType>
>
