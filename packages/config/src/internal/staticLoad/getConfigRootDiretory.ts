import { Effect } from 'effect'
import { ConfigRootDirectory } from '../../services/ConfigRootDirectory.js'
import { ConfigResolutionError } from '../../errors/ConfigResolutionError.js'
import type { ConfigQuery } from '../../ConfigQuery.js'

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
