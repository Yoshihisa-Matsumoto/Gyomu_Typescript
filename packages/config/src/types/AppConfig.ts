import type { EffectSchema } from '@gyomu/schema/entity'
import type { Schema } from 'effect'

export type AppConfig<ConfigSchema extends EffectSchema> = Schema.Schema.Type<ConfigSchema>
export type PartialAppConfig<ConfigSchema extends EffectSchema> = Partial<AppConfig<ConfigSchema>>
