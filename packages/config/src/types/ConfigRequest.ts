import type { ConfigQuery } from '../ConfigQuery.js'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { StaticResolutionMode } from './ConfigResolutionMode.js'
import type { RawConfigType } from './ConfigRawConfig.js'
import type { AppConfig } from './AppConfig.js'

/**
 * Common options shared by all configuration resolution requests.
 *
 * A request describes:
 *
 * - the target schema to validate against
 * - the resolution scope ({@link ConfigQuery})
 * - optional runtime overrides
 * - merge behavior
 * - policy violation handling
 *
 * The concrete request type determines whether static configuration,
 * runtime configuration, or both are used during resolution.
 *
 * @typeParam ConfigSchema - Schema describing the final resolved configuration.
 */
interface BaseConfigRequest<ConfigSchema extends EffectSchema> {
  /**
   * Schema used to validate and decode the final resolved configuration.
   */
  readonly schema: ConfigSchema

  /**
   * Resolution scope used to locate applicable configuration layers
   * such as user, scope, group, and function settings.
   */
  readonly query: ConfigQuery

  /**
   * Runtime configuration values supplied by the caller.
   *
   * Typical examples:
   *
   * - User input
   * - API parameters
   * - Workflow parameters
   * - AI generated options
   */
  readonly payload?: Partial<AppConfig<ConfigSchema>>

  /**
   * Custom strategy used to merge two loaded configurations.
   *
   * The resolver applies configurations in order and invokes this function
   * whenever a new configuration is merged into the current result.
   *
   * If omitted, the default override strategy is used, where values from
   * `next` replace values from `current`.
   *
   * @param current - The configuration accumulated so far.
   * @param next - The next configuration to merge.
   * @returns The merged configuration.
   */
  readonly mergeStrategy?: (
    current: AppConfig<ConfigSchema>,
    next: Partial<AppConfig<ConfigSchema>>,
  ) => AppConfig<ConfigSchema>

  /**
   * Default configuration values used when a setting is not provided by any
   * configuration source.
   *
   * These values are applied before validation and can be overridden by
   * values loaded from configuration sources.
   */
  readonly defaultConfig: AppConfig<ConfigSchema>
}

/**
 * Resolves configuration exclusively from runtime payload.
 *
 * No static configuration source is loaded.
 *
 * Suitable for:
 *
 * - User supplied settings
 * - Request parameters
 * - Temporary workflow inputs
 *
 * @typeParam ConfigSchema - Schema describing the final resolved configuration.
 */
export interface RuntimeConfigRequest<
  ConfigSchema extends EffectSchema,
> extends BaseConfigRequest<ConfigSchema> {
  /**
   * Use runtime payload only.
   */
  readonly resolutionMode: 'runtime'

  /**
   * Static configuration is not allowed in runtime mode.
   */
  readonly rawConfig?: never
}

/**
 * Resolves configuration exclusively from env (or .env file) configuration sources.
 *
 * The configuration is loaded through the provided Effect Config definition.
 *
 * Suitable for:
 *
 * - Environment variables
 * - JSON configuration files
 * - Secret stores
 * - Database-backed configuration
 *
 * @typeParam ConfigSchema - Schema describing the final resolved configuration.
 *
 * @typeParam RawConfig - The type of the raw configuration source.
 */
export interface StaticConfigRequest<
  ConfigSchema extends EffectSchema,
  RawConfig extends RawConfigType,
> extends BaseConfigRequest<ConfigSchema> {
  /**
   * The configuration resolution mode.
   */
  readonly resolutionMode: StaticResolutionMode

  /**
   * The raw configuration source content.
   */
  readonly rawConfig: RawConfig
}

/**
 * Request used by {@link ConfigResolver} to resolve a typed configuration.
 *
 * Supported modes:
 *
 * - {@link RuntimeConfigRequest}
 * - {@link StaticConfigRequest}
 *
 * @typeParam ConfigSchema - Schema describing the final resolved configuration.
 *
 * @typeParam RawConfig - The type of the raw configuration source.
 */
export type ConfigRequest<ConfigSchema extends EffectSchema, RawConfig extends RawConfigType> =
  | RuntimeConfigRequest<ConfigSchema>
  | StaticConfigRequest<ConfigSchema, RawConfig>
