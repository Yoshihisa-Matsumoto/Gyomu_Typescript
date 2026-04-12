import * as tediuous from 'tedious';
import * as tarn from 'tarn';
import { Kysely, MssqlDialect } from 'kysely';
import { DB } from '../../../db/db.js';
import { Effect, Layer, ServiceMap } from 'effect';
import { fromSync } from '../../index.js';
import { DBError } from '../../../errors.js';

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
export class MssqlService extends ServiceMap.Service<
  MssqlService,
  {
    make: (config: {
      server: string;
      port: number;
      database: string;
      user: string;
      password: string;
    }) => Effect.Effect<Kysely<DB>, DBError>;
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
      fromSync(
        DBError,
        'Failed to create MSSQL connection',
      )(() => makeMssql(config)),
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}
