import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import { Config, Effect, Exit, Layer } from 'effect'
import { NodeFileSystem } from '@effect/platform-node'
import { ConfigError, getFailureFromExit } from '@gyomu/schema'

import { ConfigProviderTest, ConfigService } from '../config.js'

describe('ConfigService', () => {
  const TestConfig = Config.all({
    logLevel: Config.string('LOG_LEVEL'),
    port: Config.number('PORT').pipe(Config.withDefault(3000)),
  })

  const TestLayer = ConfigService.live.pipe(Layer.provide(ConfigProviderTest))

  const makeRuntime = () => Layer.mergeAll(TestLayer, NodeFileSystem.layer)

  it('環境変数から設定をロードできる', async () => {
    const program = Effect.gen(function* () {
      const service = yield* ConfigService
      return yield* service.load(TestConfig)
    })

    const result = await Effect.runPromise(program.pipe(Effect.provide(makeRuntime())))

    expect(result).toEqual({
      logLevel: 'debug',
      port: 3000,
    })
  })

  it('JSONファイルから設定をロードできる', async () => {
    const dir = join(tmpdir(), `config-test-${Date.now()}`)
    mkdirSync(dir, { recursive: true })

    const file = join(dir, 'config.json')

    writeFileSync(
      file,
      JSON.stringify({
        LOG_LEVEL: 'info',
        PORT: 8080,
      }),
      'utf-8',
    )

    const program = Effect.gen(function* () {
      const service = yield* ConfigService

      return yield* service.load(TestConfig, {
        file,
      })
    })

    const result = await Effect.runPromise(program.pipe(Effect.provide(makeRuntime())))

    expect(result).toEqual({
      logLevel: 'info',
      port: 8080,
    })
  })

  it('存在しないJSONファイルの場合 ConfigError(load) で失敗する', async () => {
    const program = Effect.gen(function* () {
      const service = yield* ConfigService

      return yield* service.load(TestConfig, {
        file: '/not-found/config.json',
      })
    })

    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(makeRuntime())))

    expect(exit._tag).toBe('Failure')

    if (Exit.isFailure(exit)) {
      const error = getFailureFromExit(exit)

      expect(error).toBeInstanceOf(ConfigError)
      expect(error.phase).toBe('load')
    }
  })

  it('不正なJSONの場合 ConfigError(parse) で失敗する', async () => {
    const dir = join(tmpdir(), `config-test-invalid-${Date.now()}`)
    mkdirSync(dir, { recursive: true })

    const file = join(dir, 'invalid.json')

    writeFileSync(file, '{ invalid json', 'utf-8')

    const program = Effect.gen(function* () {
      const service = yield* ConfigService

      return yield* service.load(TestConfig, {
        file,
      })
    })

    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(makeRuntime())))

    expect(exit._tag).toBe('Failure')

    if (Exit.isFailure(exit)) {
      const error = getFailureFromExit(exit)

      expect(error).toBeInstanceOf(ConfigError)
      expect(error.phase).toBe('parse')
    }
  })

  it('必須設定が不足している場合 ConfigError(decode) で失敗する', async () => {
    const MissingConfig = Config.all({
      apiKey: Config.string('API_KEY'),
    })

    const program = Effect.gen(function* () {
      const service = yield* ConfigService

      return yield* service.load(MissingConfig)
    })

    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(makeRuntime())))

    expect(exit._tag).toBe('Failure')

    if (Exit.isFailure(exit)) {
      const error = getFailureFromExit(exit)

      expect(error).toBeInstanceOf(ConfigError)
      expect(error.phase).toBe('decode')
    }
  })
})
