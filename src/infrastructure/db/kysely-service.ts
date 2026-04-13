import { Kysely } from 'kysely';
import { DB } from '../../db/db.js';
import { ConfigLayer, ConfigService } from '../config.js';
import { MainLayer } from '../layer.js';
import { ConfigError } from 'effect/Config';
import { Config, Effect, Layer, Scope, ServiceMap } from 'effect';
import { MssqlService } from './mssql.js';
import { DBError, IOError } from '../../errors.js';

export class KyselyService extends ServiceMap.Service<
  KyselyService,
  {
    withConnection: (
      prefix: string,
    ) => Effect.Effect<
      Kysely<DB>,
      ConfigError | DBError | IOError,
      Scope.Scope | MssqlService
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
