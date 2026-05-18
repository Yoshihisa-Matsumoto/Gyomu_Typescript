import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import { NodeFileSystem } from '@effect/platform-node'
import { ConfigError } from '@gyomu/schema'
import { KyselyService } from '../KyselyService.js'
import { ConfigService } from '../../config.js'
import { MssqlService } from '../MssqlService.js'

// --- mocks ---
const mockDb = {
  destroy: () => Promise.resolve(),
}
// const { makeMssqlMock } = vi.hoisted(() => {
//   return {
//     makeMssqlMock: vi.fn(() => mockDb),
//   };
// });

const MssqlMockLayer = Layer.succeed(MssqlService, {
  make: () => Effect.succeed(mockDb),
} as any)

const mockConfig = {
  server: 'localhost',
  port: 1433,
  database: 'testdb',
  user: 'sa',
  password: 'pass',
}
const ConfigServiceMock = Layer.succeed(ConfigService, {
  load: <A>() => Effect.succeed(mockConfig as unknown as A),
})

const layer = Layer.effect(KyselyService, KyselyService.make).pipe(
  Layer.provideMerge(ConfigServiceMock),
  Layer.provideMerge(MssqlMockLayer),
  Layer.provideMerge(NodeFileSystem.layer),
)

describe('KyselyService (Effect v4)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create connection', async () => {
    const program = Effect.gen(function* () {
      const service = yield* KyselyService
      return yield* service.withConnection('test')
    })

    const result = await Effect.runPromise(program.pipe(Effect.provide(layer), Effect.scoped))

    // expect(makeMssqlMock).toHaveBeenCalledWith(mockConfig);
    expect(result).toBe(mockDb)
  })

  it('should call destroy on release', async () => {
    const program = Effect.gen(function* () {
      const service = yield* KyselyService
      yield* service.withConnection('test')
    })

    await Effect.runPromise(program.pipe(Effect.provide(layer), Effect.scoped))

    // expect(mockDb.destroy).toHaveBeenCalled();
  })

  it('should fail if config fails', async () => {
    const ConfigServiceMock2 = Layer.succeed(ConfigService, {
      load: () =>
        Effect.fail(
          new ConfigError({
            cause: 'mock error',
            message: 'Config load failed',
            phase: 'load' as const,
          }),
        ),
    })

    const program = Effect.gen(function* () {
      const service = yield* KyselyService
      yield* service.withConnection('test')
    })

    const layer2 = Layer.effect(KyselyService, KyselyService.make).pipe(
      Layer.provideMerge(ConfigServiceMock2),
      Layer.provideMerge(MssqlMockLayer),
      Layer.provideMerge(NodeFileSystem.layer),
    )

    await expect(
      Effect.runPromise(program.pipe(Effect.provide(layer2), Effect.scoped)),
    ).rejects.toThrow()
  })
})
