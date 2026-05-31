import { describe, expect, it, vi } from 'vitest'
import { Effect, FileSystem } from 'effect'

import { ConfigService } from '@gyomu/infra'
import { loadJsonFile } from '../loadJsonFile.js'
import { ConfigResolutionError } from '../../../errors/ConfigResolutionError.js'

describe('loadJsonFile', () => {
  const request = {
    query: {
      userId: 'user-1',
    },
    rawConfig: {
      host: 'HOST',
      port: 'PORT',
    },
  } as any

  const layer = 'scope' as const
  const settingFilePath = '/config/setting.json'

  it('returns loaded config', async () => {
    const values = {
      host: 'localhost',
      port: 3000,
    }

    const result = await loadJsonFile(request, layer, settingFilePath, {}).pipe(
      Effect.provideService(ConfigService, {
        load: vi.fn(() => Effect.succeed(values)),
      } as any),
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.runPromise,
    )

    expect(result).toEqual({
      layer,
      source: 'file',
      values,
    })
  })

  it('returns undefined when load ConfigError occurs', async () => {
    const result = await loadJsonFile(request, layer, settingFilePath, {}).pipe(
      Effect.provideService(ConfigService, {
        load: vi.fn(() =>
          Effect.fail({
            _tag: 'ConfigError',
            phase: 'load',
          }),
        ),
      } as any),
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.runPromise,
    )

    expect(result).toBeUndefined()
  })

  it('passes file option to ConfigService', async () => {
    const load = vi.fn((_config: unknown, _options?: unknown) => Effect.succeed({}))

    await loadJsonFile(request, layer, settingFilePath, {}).pipe(
      Effect.provideService(ConfigService, {
        load,
      } as any),
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.runPromise,
    )

    expect(load).toHaveBeenCalledTimes(1)

    expect(load).toHaveBeenCalledWith(expect.anything(), {
      file: settingFilePath,
    })
  })

  it('maps unexpected errors to ConfigResolutionError', async () => {
    const cause = new Error('boom')

    const error = await loadJsonFile(request, layer, settingFilePath, {}).pipe(
      Effect.provideService(ConfigService, {
        load: vi.fn(() => Effect.fail(cause)),
      } as any),
      Effect.flip,
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.runPromise,
    )

    expect(error).toBeInstanceOf(ConfigResolutionError)

    expect(error.message).toBe('fail to load file')
    expect(error.phase).toBe('config-load')
    expect(error.retryable).toBe(false)
    expect(error.query).toEqual(request.query)
    expect(error.cause).toBe(cause)
  })
})
