import { describe, expect, it, vi } from 'vitest'
import { Effect, FileSystem } from 'effect'

import { ConfigService } from '@gyomu/infra'
import { resolveJsonConfig } from '../resolveJsonConfig.js'
import { loadJsonFile } from '../loadJsonFile.js'

vi.mock('../loadJsonFile.js', () => ({
  loadJsonFile: vi.fn(),
}))

const mockedLoadJsonFile = vi.mocked(loadJsonFile)

const createRequest = (query = {}) =>
  ({
    query,
    rawConfig: {},
  }) as any

const createFileSystem = (exists: ReturnType<typeof vi.fn>) =>
  ({
    exists,
  }) as any

describe('resolveJsonConfig test', () => {
  it('returns undefined when file does not exist', async () => {
    const result = await resolveJsonConfig(createRequest(), 'global', '/tmp/setting.json').pipe(
      Effect.provideService(
        FileSystem.FileSystem,
        createFileSystem(vi.fn(() => Effect.succeed(false))),
      ),
      Effect.provideService(ConfigService, {} as any),
      Effect.runPromise,
    )

    expect(result).toBeUndefined()
    expect(mockedLoadJsonFile).not.toHaveBeenCalled()
  })
  it('returns grouped config first for global layer', async () => {
    const loaded = {
      layer: 'global' as const,
      source: 'file' as const,
      values: { host: 'localhost' },
    }

    mockedLoadJsonFile.mockReturnValueOnce(Effect.succeed(loaded))

    const result = await resolveJsonConfig(
      createRequest({
        scope: 'admin',
        function: 'notify',
      }),
      'global',
      '/tmp/setting.json',
    ).pipe(
      Effect.provideService(
        FileSystem.FileSystem,
        createFileSystem(vi.fn(() => Effect.succeed(true))),
      ),
      Effect.provideService(ConfigService, {} as any),
      Effect.runPromise,
    )
    console.log(JSON.stringify(result, null, 2))
    expect(result).toEqual(loaded)

    expect(mockedLoadJsonFile).toHaveBeenCalledWith(
      expect.anything(),
      'global',
      '/tmp/setting.json',
      {
        scope: 'admin',
        function: 'notify',
      },
    )
  })

  it('falls back to function lookup for global layer', async () => {
    const loaded = {
      layer: 'global' as const,
      source: 'file' as const,
      values: { host: 'localhost' },
    }

    mockedLoadJsonFile
      .mockReturnValueOnce(Effect.succeed(undefined))
      .mockReturnValueOnce(Effect.succeed(loaded))

    const result = await resolveJsonConfig(
      createRequest({
        scope: 'admin',
        function: 'notify',
      }),
      'global',
      '/tmp/setting.json',
    ).pipe(
      Effect.provideService(
        FileSystem.FileSystem,
        createFileSystem(vi.fn(() => Effect.succeed(true))),
      ),
      Effect.provideService(ConfigService, {} as any),
      Effect.runPromise,
    )

    expect(result).toEqual(loaded)

    expect(mockedLoadJsonFile).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      'global',
      '/tmp/setting.json',
      {
        scope: 'admin',
        function: 'notify',
      },
    )

    expect(mockedLoadJsonFile).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      'global',
      '/tmp/setting.json',
      {
        function: 'notify',
      },
    )
  })
  it('falls back to root lookup for scope layer', async () => {
    const loaded = {
      layer: 'scope' as const,
      source: 'file' as const,
      values: { host: 'localhost' },
    }

    mockedLoadJsonFile
      .mockReturnValueOnce(Effect.succeed(undefined))
      .mockReturnValueOnce(Effect.succeed(loaded))

    const result = await resolveJsonConfig(
      createRequest({
        function: 'notify',
      }),
      'scope',
      '/tmp/setting.json',
    ).pipe(
      Effect.provideService(
        FileSystem.FileSystem,
        createFileSystem(vi.fn(() => Effect.succeed(true))),
      ),
      Effect.provideService(ConfigService, {} as any),
      Effect.runPromise,
    )

    expect(result).toEqual(loaded)

    expect(mockedLoadJsonFile).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      'scope',
      '/tmp/setting.json',
      {
        function: 'notify',
      },
    )

    expect(mockedLoadJsonFile).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      'scope',
      '/tmp/setting.json',
      {},
    )
  })
})
