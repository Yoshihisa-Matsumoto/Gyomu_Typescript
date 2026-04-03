import * as tediuous from 'tedious';
import * as tarn from 'tarn';
import { Kysely, MssqlDialect } from 'kysely';
import { DB } from '../../../db/db.js';

export const makeMssql = (config: {
  server: string;
  port: number;
  database: string;
  user: string;
  password: string;
}) => {
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
