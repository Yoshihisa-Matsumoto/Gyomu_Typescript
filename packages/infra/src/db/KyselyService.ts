import { Config, Context, Effect, Layer } from 'effect'
import { ConfigLayer, ConfigService } from '../config.js'
import { MainLayer } from '../layer.js'
import { MssqlService } from './MssqlService.js'
import type { DB } from '../generated/db.js'
import type { FileSystem, Scope } from 'effect'
import type { Kysely } from 'kysely'
import type { ConfigError, DBError, IOError } from '@gyomu/core'

export class KyselyService extends Context.Service<
  KyselyService,
  {
    withConnection: (
      prefix: string,
    ) => Effect.Effect<
      Kysely<DB>,
      ConfigError | DBError | IOError,
      Scope.Scope | MssqlService | FileSystem.FileSystem
    >
  }
>()('KyselyService', {
  make: Effect.gen(function* () {
    const configService = yield* ConfigService
    return {
      withConnection: (prefix) =>
        Effect.gen(function* () {
          const dbConfigRaw = Config.all({
            server: Config.string(`${prefix.toUpperCase()}_SERVER`),
            port: Config.number(`${prefix.toUpperCase()}_PORT`),
            database: Config.string(`${prefix.toUpperCase()}_DATABASE`),
            user: Config.string(`${prefix.toUpperCase()}_USER`),
            password: Config.string(`${prefix.toUpperCase()}_PASSWORD`),
          })
          const dbConfig = yield* configService.load(dbConfigRaw)
          const mssql = yield* MssqlService

          return yield* Effect.acquireRelease(mssql.make(dbConfig), (db) =>
            Effect.promise(async () => await db.destroy()),
          )
        }),
    }
  }),
}) {
  static readonly live = Layer.effect(this, this.make)
}

export const DBLayer = Layer.mergeAll(MainLayer, ConfigLayer, KyselyService.live)
