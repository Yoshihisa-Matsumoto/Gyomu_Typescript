import { describe, expect, it, vi } from 'vitest'
import { Effect, FileSystem } from 'effect'
import { ConfigService } from '@gyomu/infra'
import { ConfigRootDirectory, ConfigRootDirectoryLive } from '../ConfigRootDirectory.js'

describe('ConfigRootDirectory', () => {
  it('uses default key when envKey is omitted', async () => {
    const load = vi.fn(() => Effect.succeed('/custom/config'))

    const service = {
      load,
    }

    const result = await Effect.gen(function* () {
      const configRootDirectory = yield* ConfigRootDirectory

      return yield* configRootDirectory.get()
    }).pipe(
      Effect.provide(ConfigRootDirectoryLive),
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.provideService(ConfigService, service as any),
      Effect.runPromise,
    )

    expect(result).toBe('/custom/config')
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('uses provided env key', async () => {
    const load = vi.fn(() => Effect.succeed('/custom/config'))

    const service = {
      load,
    }

    await Effect.gen(function* () {
      const configRootDirectory = yield* ConfigRootDirectory

      return yield* configRootDirectory.get('CUSTOM_ROOT_PATH')
    }).pipe(
      Effect.provide(ConfigRootDirectoryLive),
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.provideService(ConfigService, service as any),
      Effect.runPromise,
    )

    expect(load).toHaveBeenCalledTimes(1)
  })

  it('uses default key when envKey is omitted', async () => {
    const load = vi.fn(() => Effect.succeed('/config'))

    const result = await Effect.gen(function* () {
      const service = yield* ConfigRootDirectory
      return yield* service.get()
    }).pipe(
      Effect.provide(ConfigRootDirectoryLive),
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.provideService(ConfigService, { load } as any),
      Effect.runPromise,
    )

    expect(result).toBe('/config')
    expect(load).toHaveBeenCalledTimes(1)
  })
})
