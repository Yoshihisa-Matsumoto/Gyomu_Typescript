import { Effect, Layer, ServiceMap, Redacted, Config, Schema } from 'effect';
import { Client } from 'basic-ftp';
import { withDefault } from 'effect/Config';
import { NetworkError, unknownError } from '../../../errors.js';

const ftpConfigRaw = Config.all({
  host: Config.string('HOST'),
  port: withDefault(Config.number('PORT'), 21),
  user: Config.string('USER'),
  password: Config.redacted('PASS'),

  secure: withDefault(Config.boolean('SSL'), false),
});

type FtpConfig = Config.Success<typeof ftpConfigRaw>;

export class FtpConfigService extends ServiceMap.Service<
  FtpConfigService,
  FtpConfig
>()('FtpConfigService') {}

export const FtpConfigLive = Layer.effect(
  FtpConfigService,
  ftpConfigRaw.asEffect(),
);

export class FtpService extends ServiceMap.Service<FtpService>()('FtpService', {
  make: Effect.gen(function* () {
    const config = yield* FtpConfigService;

    const client = new Client();

    yield* Effect.tryPromise({
      try: () =>
        client.access({
          host: config.host,
          user: config.user,
          password: Redacted.value(config.password),
          port: config.port,
          secure: config.secure,
        }),
      catch: (e) => unknownError(NetworkError, e, `FTP Access Error`),
    });

    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        if (!client.closed) client.close();
      }),
    );

    return { client };
  }),
}) {
  static readonly live = Layer.effect(this, this.make).pipe(
    Layer.provide(FtpConfigLive),
  );
}
