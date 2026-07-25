import { join } from 'node:path'
import { ConfigService } from '@gyomu/infra'
import { Config, Context, Effect, Layer } from 'effect'
import type { FileSystem } from 'effect'
import type { ConfigError, IOError } from '@gyomu/schema'

interface ConfigRootDirectoryService {
  readonly get: (
    envKey?: string,
  ) => Effect.Effect<string, ConfigError | IOError, FileSystem.FileSystem | ConfigService>
}

/**
 * Represents the service interface for accessing the application's configuration root directory.
 */
export class ConfigRootDirectory extends Context.Service<
  ConfigRootDirectory,
  ConfigRootDirectoryService
>()('@gyomu/config/ConfigRootDirectory') {}

const DEFAULT_KEY = 'CONFIG_ROOT_PATH'

/**
 * A Layer that provides the live implementation of ConfigRootDirectory, using ConfigService to retrieve the root path from environment variables with a default fallback to the 'config' directory in the process working directory.
 */
export const ConfigRootDirectoryLive = Layer.effect(
  ConfigRootDirectory,
  Effect.gen(function* () {
    const configService = yield* ConfigService

    return {
      get: (envKey = DEFAULT_KEY) =>
        configService.load(
          Config.withDefault(Config.string(envKey), join(process.cwd(), 'config')),
        ),
    }
  }),
)
