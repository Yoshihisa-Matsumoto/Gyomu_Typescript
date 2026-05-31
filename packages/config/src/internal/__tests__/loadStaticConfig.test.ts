import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, FileSystem } from 'effect'

import { ConfigService } from '@gyomu/infra'
import { loadStaticConfig } from '../loadStaticConfig.js'
import * as GetConfigRootDirectoryModule from '../staticLoad/getConfigRootDiretory.js'
import * as BuildConfigPaths from '../staticLoad/buildConfigPaths.js'
import * as ResolveJsonConfig from '../staticLoad/resolveJsonConfig.js'
import { ConfigRootDirectory } from '../../services/ConfigRootDirectory.js'
import { ConfigResolutionError } from '../../errors/ConfigResolutionError.js'

const mockedGetConfigRootDiretory = vi.spyOn(GetConfigRootDirectoryModule, 'getConfigRootDiretory')

const mockedBuildConfigPaths = vi.spyOn(BuildConfigPaths, 'buildConfigPaths')

const mockedResolveJsonConfig = vi.spyOn(ResolveJsonConfig, 'resolveJsonConfig')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('loadStaticConfig test', () => {
  it('loads all config layers', async () => {
    const request = {
      query: {},
      rawConfig: {},
    } as any

    mockedGetConfigRootDiretory.mockReturnValue(Effect.succeed('/config'))

    mockedBuildConfigPaths.mockReturnValue(
      new Map([
        ['global', '/config/setting.json'],
        ['scope', '/config/scope.json'],
      ]),
    )

    const globalConfig = {
      layer: 'global' as const,
      source: 'file' as const,
      values: { a: 1 },
    }

    const scopeConfig = {
      layer: 'scope' as const,
      source: 'file' as const,
      values: { b: 2 },
    }

    mockedResolveJsonConfig
      .mockReturnValueOnce(Effect.succeed(globalConfig))
      .mockReturnValueOnce(Effect.succeed(scopeConfig))

    const result = await loadStaticConfig(request).pipe(
      Effect.provideService(ConfigService, {} as any),
      Effect.provideService(ConfigRootDirectory, {} as any),
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.runPromise,
    )

    expect(result).toEqual([globalConfig, scopeConfig])

    expect(mockedGetConfigRootDiretory).toHaveBeenCalledWith(request.query)

    expect(mockedBuildConfigPaths).toHaveBeenCalledWith('/config', request.query)

    expect(mockedResolveJsonConfig).toHaveBeenNthCalledWith(
      1,
      request,
      'global',
      '/config/setting.json',
    )

    expect(mockedResolveJsonConfig).toHaveBeenNthCalledWith(
      2,
      request,
      'scope',
      '/config/scope.json',
    )
  })
  it('filters undefined configs', async () => {
    const request = {
      query: {},
      rawConfig: {},
    } as any

    mockedGetConfigRootDiretory.mockReturnValue(Effect.succeed('/config'))

    mockedBuildConfigPaths.mockReturnValue(
      new Map([
        ['global', '/config/global.json'],
        ['scope', '/config/scope.json'],
      ]),
    )

    const loaded = {
      layer: 'scope' as const,
      source: 'file' as const,
      values: { a: 1 },
    }

    mockedResolveJsonConfig
      .mockReturnValueOnce(Effect.succeed(undefined))
      .mockReturnValueOnce(Effect.succeed(loaded))

    const result = await loadStaticConfig(request).pipe(
      Effect.provideService(ConfigService, {} as any),
      Effect.provideService(ConfigRootDirectory, {} as any),
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.runPromise,
    )

    expect(result).toEqual([loaded])
  })
  it('propagates getConfigRootDiretory error', async () => {
    const error = new ConfigResolutionError({
      message: 'boom',
      phase: 'config-load',
      query: {},
      cause: undefined,
      retryable: false,
    })

    mockedGetConfigRootDiretory.mockReturnValue(Effect.fail(error))

    await expect(
      loadStaticConfig({
        query: {},
        rawConfig: {},
      } as any).pipe(
        Effect.provideService(ConfigService, {} as any),
        Effect.provideService(ConfigRootDirectory, {} as any),
        Effect.provideService(FileSystem.FileSystem, {} as any),
        Effect.runPromise,
      ),
    ).rejects.toBe(error)
  })
  it('propagates resolveJsonConfig error', async () => {
    const request = {
      query: {},
      rawConfig: {},
    } as any

    mockedGetConfigRootDiretory.mockReturnValue(Effect.succeed('/config'))

    mockedBuildConfigPaths.mockReturnValue(new Map([['global', '/config/global.json']]))

    const error = new ConfigResolutionError({
      message: 'boom',
      phase: 'config-load',
      query: {},
      cause: undefined,
      retryable: false,
    })

    mockedResolveJsonConfig.mockReturnValue(Effect.fail(error))

    await expect(
      loadStaticConfig(request).pipe(
        Effect.provideService(ConfigService, {} as any),
        Effect.provideService(ConfigRootDirectory, {} as any),
        Effect.provideService(FileSystem.FileSystem, {} as any),
        Effect.runPromise,
      ),
    ).rejects.toBe(error)
  })
})
