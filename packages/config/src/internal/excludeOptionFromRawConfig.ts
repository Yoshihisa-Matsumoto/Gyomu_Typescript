import { Option } from 'effect'
import type { ExcludeOption } from '../types/ExcludeOption.js'
import type { ConfigRawConfig, RawConfigType } from '../types/ConfigRawConfig.js'

/**
 * Recursively transforms a configuration object by unwrapping all Option values into their contained values or undefined.
 *
 * @param record The raw configuration object containing potential Option values.
 *
 * @returns A new configuration object with all Options replaced by their inner values.
 */
export const excludeOptionFromRawConfig = <RawConfig extends ConfigRawConfig<RawConfigType>>(
  record: RawConfig,
): ExcludeOption<RawConfig> => {
  const convert = (value: unknown): unknown => {
    if (Option.isOption(value)) {
      return Option.getOrUndefined(value)
    }

    if (Array.isArray(value)) {
      return value.map(convert)
    }

    if (value !== null && typeof value === 'object') {
      const result: Record<string, unknown> = {}

      for (const [key, child] of Object.entries(value)) {
        result[key] = convert(child)
      }

      return result
    }

    return value
  }

  return convert(record) as ExcludeOption<RawConfig>
}
