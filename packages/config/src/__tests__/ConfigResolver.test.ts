import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'

import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { makeRunner } from '@gyomu/schema/effect'
import { ConfigResolver, ConfigResolverLive } from '../ConfigResolver.js'
import * as loadEnvConfigMod from '../internal/loadEnvConfig.js'
import * as loadStaticConfigMod from '../internal/loadStaticConfig.js'
import * as decodeMod from '../internal/decodeRawLoadedConfig.js'
import * as mergeMod from '../internal/mergeSources.js'
import { ConfigRootDirectoryLive } from '../services/ConfigRootDirectory.js'

vi.mock('../internal/loadEnvConfig.js', () => ({
  loadEnvConfig: vi.fn(),
}))

vi.mock('../internal/loadStaticConfig.js', () => ({
  loadStaticConfig: vi.fn(),
}))

vi.mock('../internal/decodeRawLoadedConfig.js', () => ({
  decodeRawLoadedConfigs: vi.fn(),
}))

vi.mock('../internal/mergeSources.js', () => ({
  mergeSources: vi.fn(),
}))

const mockedEnv = vi.mocked(loadEnvConfigMod.loadEnvConfig)
const mockedStatic = vi.mocked(loadStaticConfigMod.loadStaticConfig)
const mockedDecode = vi.mocked(decodeMod.decodeRawLoadedConfigs)
const mockedMerge = vi.mocked(mergeMod.mergeSources)

beforeEach(() => {
  vi.clearAllMocks()
})

const TestLayer = Layer.mergeAll(
  MainLayer,
  ConfigLayer,
  ConfigRootDirectoryLive,
  ConfigResolverLive,
)
  .pipe(Layer.provideMerge(ConfigRootDirectoryLive))
  .pipe(Layer.provideMerge(ConfigLayer))
  .pipe(Layer.provideMerge(PlatformLayer))
const runner = makeRunner(TestLayer)

describe('ConfigResolver', () => {
  it('resolves env config', async () => {
    const request = {
      resolutionMode: 'env',
      defaultConfig: { base: true },
    } as any

    const envConfig = {
      layer: 'global',
      source: 'env',
      values: { host: 'localhost' },
    }

    const decoded = [
      { layer: 'global' as const, source: 'env' as const, values: { host: 'localhost' } },
    ]
    const merged = { host: 'localhost' }

    mockedEnv.mockReturnValue(Effect.succeed(envConfig) as any)

    mockedDecode.mockReturnValue(Effect.succeed(decoded))

    mockedMerge.mockReturnValue(merged)

    const program = Effect.gen(function* () {
      const configResolver = yield* ConfigResolver
      return yield* configResolver.get(request)
    })
    const result = await runner(program)

    // const result = await resolver
    //   .get(request)
    //   .pipe(Effect.provideService(ConfigResolverLive), Effect.runPromise)

    expect(result).toEqual(merged)
    expect(mockedEnv).toHaveBeenCalled()
    expect(mockedDecode).toHaveBeenCalled()
    expect(mockedMerge).toHaveBeenCalled()
  })
  it('resolves static config', async () => {
    const request = {
      resolutionMode: 'static',
      defaultConfig: { base: true },
    } as any

    mockedStatic.mockReturnValue(
      Effect.succeed([
        {
          layer: 'global',
          source: 'file',
          values: { a: 1 },
        },
      ]),
    )

    mockedDecode.mockReturnValue(
      Effect.succeed([{ layer: 'global' as const, source: 'file' as const, values: { a: 1 } }]),
    )

    mockedMerge.mockReturnValue({ a: 1 })

    const program = Effect.gen(function* () {
      const configResolver = yield* ConfigResolver
      return yield* configResolver.get(request)
    })
    const result = await runner(program)

    expect(result).toEqual({ a: 1 })
    expect(mockedStatic).toHaveBeenCalled()
  })

  it('uses runtime payload only', async () => {
    const request = {
      resolutionMode: 'runtime',
      payload: { runtime: true },
      defaultConfig: { base: true },
    } as any

    mockedDecode.mockReturnValue(
      Effect.succeed([
        {
          layer: 'user',
          source: 'runtime',
          values: { runtime: true },
        },
      ]),
    )

    mockedMerge.mockReturnValue({ runtime: true })

    const program = Effect.gen(function* () {
      const configResolver = yield* ConfigResolver
      return yield* configResolver.get(request)
    })
    const result = await runner(program)

    expect(result).toEqual({ runtime: true })
  })
  it('returns defaultConfig when no sources exist', async () => {
    const request = {
      resolutionMode: 'runtime',
      defaultConfig: { fallback: true },
    } as any

    mockedDecode.mockReturnValue(Effect.succeed([]))

    const program = Effect.gen(function* () {
      const configResolver = yield* ConfigResolver
      return yield* configResolver.get(request)
    })
    const result = await runner(program)

    expect(result).toEqual({ fallback: true })
  })
})
