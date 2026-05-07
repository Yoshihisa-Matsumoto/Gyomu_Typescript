import * as tediuous from 'tedious';
import * as tarn from 'tarn';
import { Kysely, MssqlDialect } from 'kysely';
import { DB } from '../generated/db.js';
import { Effect, Layer, Scope, Context } from 'effect';
import { fromSync } from '@gyomu/shared/effect';
import { DBError } from '@gyomu/core';

const makeMssql = (config: {
  server: string;
  port: number;
  database: string;
  user: string;
  password: string;
}) => {
  // const pool = new ConnectionPool({
  //   server: config.server,
  //   database: config.database,
  //   port: config.port,
  //   user: config.user,
  //   password: config.password,
  //   options: {
  //     trustServerCertificate: true,
  //   },
  // });
  // await pool.connect();

  return new Kysely<DB>({
    dialect: new MssqlDialect({
      tarn: {
        ...tarn,
        options: {
          min: 0,
          max: 10,
          idleTimeoutMillis: 1,
          reapIntervalMillis: 1,
        },
      },
      tedious: {
        ...tediuous,

        connectionFactory: () =>
          new tediuous.Connection({
            authentication: {
              options: {
                userName: config.user,
                password: config.password,
              },
              type: 'default',
            },
            server: config.server,
            options: {
              database: config.database,
              port: config.port,
              trustServerCertificate: true,
            },
          }),
      },
    }),
  });
};
export class MssqlService extends Context.Service<
  MssqlService,
  {
    make: (config: {
      server: string;
      port: number;
      database: string;
      user: string;
      password: string;
    }) => Effect.Effect<Kysely<DB>, DBError, Scope.Scope>;
  }
>()('MssqlService', {
  make: Effect.succeed({
    make: (config: {
      server: string;
      port: number;
      database: string;
      user: string;
      password: string;
    }) =>
      Effect.acquireRelease(
        fromSync(DBError, () => ({
          message: 'Failed to create MSSQL connection',
          operation: 'custom' as const,
          params: config,
        }))(() => makeMssql(config)),
        (db) => {
          return Effect.promise(async () => {
            await db.destroy();
            await new Promise((r) => setTimeout(r, 10));
            console.log('DB Close');
          });
        },
      ),
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}
