import { Option } from 'effect'
import type { ExcludeOption } from '../types/ExcludeOption.js'
import type { ConfigRawConfig } from '../types/ConfigRawConfig.js'

export const excludeOptionFromRawConfig = <RawConfig extends ConfigRawConfig>(
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
