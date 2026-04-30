import { Kysely } from 'kysely';
import { DB } from '../generated/db.js';
import { ConfigLayer, ConfigService } from '../config.js';
import { MainLayer } from '../layer.js';
import { Config, Effect, Layer, Scope, ServiceMap, FileSystem } from 'effect';
import { MssqlService } from './MssqlService.js';
import { DBError, IOError, ConfigError } from '@gyomu/core';

export class KyselyService extends ServiceMap.Service<
  KyselyService,
  {
    withConnection: (
      prefix: string,
    ) => Effect.Effect<
      Kysely<DB>,
      ConfigError | DBError | IOError,
      Scope.Scope | MssqlService | FileSystem.FileSystem
    >;
  }
>()('KyselyService', {
  make: Effect.gen(function* () {
    const configService = yield* ConfigService;
    return {
      withConnection: (prefix) =>
        Effect.gen(function* () {
          const dbConfigRaw = Config.all({
            server: Config.string(`${prefix.toUpperCase()}_SERVER`),
            port: Config.number(`${prefix.toUpperCase()}_PORT`),
            database: Config.string(`${prefix.toUpperCase()}_DATABASE`),
            user: Config.string(`${prefix.toUpperCase()}_USER`),
            password: Config.string(`${prefix.toUpperCase()}_PASSWORD`),
          });
          const dbConfig = yield* configService.load(dbConfigRaw);
          const mssql = yield* MssqlService;

          return yield* Effect.acquireRelease(mssql.make(dbConfig), (db) =>
            Effect.promise(() => db.destroy()),
          );
        }),
    };
  }),
}) {
  static readonly live = Layer.effect(this, this.make).pipe(
    Layer.provide(ConfigLayer),
    Layer.provide(MssqlService.live),
  );
}

export const DBLayer = Layer.mergeAll(
  MainLayer,
  ConfigLayer,
  KyselyService.live,
);
