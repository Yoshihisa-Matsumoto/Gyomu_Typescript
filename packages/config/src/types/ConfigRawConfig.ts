import type { ExtractConfig, NormalizeOptionObject } from '@gyomu/schema'
import type { Config } from 'effect'

export type RawConfigType = Config.Config<Record<string, unknown>>

export type ConfigRawConfig<ConfigType extends RawConfigType> = ExtractConfig<
  NormalizeOptionObject<ConfigType>
>
