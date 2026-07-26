import { Effect } from 'effect'
import { ConfigRootDirectory } from '../../services/ConfigRootDirectory.js'
import { ConfigResolutionError } from '../../errors/ConfigResolutionError.js'
import type { ConfigQuery } from '../../ConfigQuery.js'

/**
 * Retrieves the configuration root directory for the specified query and optional configuration key.
 *
 * @param query The configuration query context.
 *
 * @param configKey Optional key to specify a sub-path within the config root.
 *
 * @returns An Effect that yields the directory path or fails with a ConfigResolutionError.
 */
export const getConfigRootDiretory = (query: ConfigQuery, configKey?: string) =>
  Effect.gen(function* () {
    const configRootDirectory = yield* ConfigRootDirectory
    return yield* configRootDirectory.get(configKey)
  }).pipe(
    Effect.mapError(
      (e) =>
        new ConfigResolutionError({
          cause: e,
          message: 'fail to get config root directory',
          phase: 'config-load',
          query,
          retryable: false,
        }),
    ),
  )
