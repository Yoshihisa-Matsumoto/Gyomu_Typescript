import { describe, expect, it, vi } from 'vitest'
import { Effect, FileSystem } from 'effect'
import { ConfigService } from '@gyomu/infra'
import { getFailureFromExit } from '@gyomu/schema'
import { loadEnvConfig } from '../loadEnvConfig.js'
import { ConfigResolutionError } from '../../errors/ConfigResolutionError.js'

const createRequest = () =>
  ({
    query: {
      serviceId: 'service-a',
    },
    rawConfig: {
      host: 'HOST',
      port: 'PORT',
    },
  }) as any

describe('loadEnvConfig', () => {
  it('returns loaded config when config exists', async () => {
    const request = createRequest()

    const loadedValues = {
      host: 'localhost',
      port: 3000,
    }

    const result = await loadEnvConfig(request).pipe(
      Effect.provideService(ConfigService, {
        load: vi.fn(() => Effect.succeed(loadedValues)),
      } as any),
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.runPromise,
    )

    expect(result).toEqual({
      layer: 'global',
      source: 'env',
      values: loadedValues,
    })
  })

  it('returns undefined when ConfigError(load) occurs', async () => {
    const request = createRequest()

    const configError = {
      _tag: 'ConfigError',
      phase: 'load',
      message: 'not found',
    }

    const result = await loadEnvConfig(request).pipe(
      Effect.provideService(ConfigService, {
        load: vi.fn(() => Effect.fail(configError)),
      } as any),
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.runPromise,
    )

    expect(result).toBeUndefined()
  })

  it('maps unexpected errors to ConfigResolutionError', async () => {
    const request = createRequest()

    const cause = new Error('boom')

    const exit = await loadEnvConfig(request).pipe(
      Effect.provideService(ConfigService, {
        load: vi.fn(() => Effect.fail(cause)),
      } as any),
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.exit,
      Effect.runPromise,
    )

    expect(exit._tag).toBe('Failure')

    if (exit._tag === 'Failure') {
      const error = getFailureFromExit(exit)

      expect(error._tag).toBe('ConfigResolutionError')
      expect(error).toBeInstanceOf(ConfigResolutionError)

      const resolutionError = error

      expect(resolutionError.phase).toBe('config-load')
      expect(resolutionError.retryable).toBe(false)
      expect(resolutionError.query).toEqual(request.query)
      expect(resolutionError.cause).toBe(cause)
    }
  })

  it('includes rawConfig in details', async () => {
    const request = createRequest()

    const cause = new Error('boom')

    const exit = await loadEnvConfig(request).pipe(
      Effect.provideService(ConfigService, {
        load: vi.fn(() => Effect.fail(cause)),
      } as any),
      Effect.exit,
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.runPromise,
    )

    expect(exit._tag).toBe('Failure')

    if (exit._tag === 'Failure') {
      const error = getFailureFromExit(exit)

      expect(error._tag).toBe('ConfigResolutionError')

      const resolutionError = error

      expect(resolutionError.details).toEqual(request.rawConfig)
    }
  })
})
