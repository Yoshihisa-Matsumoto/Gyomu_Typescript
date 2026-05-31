import { describe, expect, it, vi } from 'vitest'
import { Effect, FileSystem } from 'effect'
import { getFailureFromExit } from '@gyomu/schema/effect'
import { ConfigService } from '@gyomu/infra'
import { getConfigRootDiretory } from '../getConfigRootDiretory.js'
import { ConfigRootDirectory } from '../../../services/ConfigRootDirectory.js'
import { ConfigResolutionError } from '../../../errors/ConfigResolutionError.js'

describe('getConfigRootDiretory', () => {
  const query = {
    userId: 'user-1',
    scope: 'admin',
  }

  it('returns config root directory', async () => {
    const result = await getConfigRootDiretory(query).pipe(
      Effect.provideService(ConfigRootDirectory, {
        get: vi.fn(() => Effect.succeed('/config')),
      } as any),
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.provideService(ConfigService, {} as any),
      Effect.runPromise,
    )

    expect(result).toBe('/config')
  })

  it('passes configKey to service', async () => {
    const get = vi.fn(() => Effect.succeed('/custom'))

    const result = await getConfigRootDiretory(query, 'CUSTOM_CONFIG_ROOT').pipe(
      Effect.provideService(ConfigRootDirectory, {
        get,
      } as any),
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.provideService(ConfigService, {} as any),
      Effect.runPromise,
    )

    expect(result).toBe('/custom')

    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith('CUSTOM_CONFIG_ROOT')
  })

  it('maps service errors to ConfigResolutionError', async () => {
    const cause = new Error('boom')

    const exit = await getConfigRootDiretory(query).pipe(
      Effect.provideService(ConfigRootDirectory, {
        get: vi.fn(() => Effect.fail(cause)),
      } as any),
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.provideService(ConfigService, {} as any),
      Effect.exit,
      Effect.runPromise,
    )

    expect(exit._tag).toBe('Failure')

    if (exit._tag === 'Failure') {
      const failure = getFailureFromExit(exit)

      expect(failure._tag).toBe('ConfigResolutionError')

      const error = failure

      expect(error).toBeInstanceOf(ConfigResolutionError)

      expect(error.message).toBe('fail to get config root directory')

      expect(error.phase).toBe('config-load')
      expect(error.retryable).toBe(false)
      expect(error.query).toEqual(query)
      expect(error.cause).toBe(cause)
    }
  })
})
