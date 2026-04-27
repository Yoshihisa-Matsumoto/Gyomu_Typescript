import { platform } from '../fs/index.js';

import pino from 'pino';
import type { Logger as PinoLogger } from 'pino';
import { reconcile } from '../../shared/object/diff.js';
import { format } from 'date-fns';
import { Config, Logger, Schema, Option, Effect, Layer } from 'effect';
import { ConfigLayer, ConfigService } from '../config.js';
import { makeRunner } from '../runtime.js';
import { PlatformLayer } from '../layer.js';
interface LeveledLogMethod {
  (message: any, ...meta: any[]): void;
}
interface Logger {
  error: LeveledLogMethod;
  warn: LeveledLogMethod;
  debug: LeveledLogMethod;
  info: LeveledLogMethod;
  isDebugEnabled(): boolean;

  end(): Promise<void>;
}
class InternalLogger implements Logger {
  constructor(private readonly logger: PinoLogger) {}
  info(message: any, ...meta: any[]) {
    // console.log('logger.level =', this.logger.level);
    // console.log(
    //   this.logger.transports.map((t) => ({
    //     name: t.constructor.name,
    //     level: t.level,
    //   })),
    // );
    this.logger.info(message, ...meta);
  }
  debug(message: any, ...meta: any[]) {
    this.logger.debug(message, ...meta);
  }
  error(message: any, ...meta: any[]) {
    this.logger.error(message, ...meta);
  }
  warn(message: any, ...meta: any[]) {
    this.logger.warn(message, ...meta);
  }
  isDebugEnabled() {
    return this.logger.level == 'debug';
  }
  async end() {
    if (transport) {
      await new Promise((resolve) => {
        transport?.end();
        transport?.on('close', resolve);
      });
    }
  }
}
let transport: ReturnType<typeof pino.transport> | undefined = undefined;
export let LogFileName: string | undefined = undefined;
let loggerInstance: InternalLogger | null = null;

const loggerConfigRaw = Config.all({
  logLevel: Config.withDefault(Config.string(`LOGGER_LEVEL`), 'info'),
  fixedLogFilename: Config.withDefault(
    Config.boolean(`FIXED_LOGFILENAME`),
    false,
  ),
  logPath: Config.withDefault(Config.string(`LOGPATH`), platform.tmpdir()),
  logFilename: Config.option(Config.string('LOGFILENAME')),
});
type ExtractConfig<T> = T extends Config.Config<infer A> ? A : never;
type UnwrapOption<T> = T extends Option.Option<infer A> ? A | undefined : T;

type NormalizeOptionObject<T> = {
  [K in keyof T as T[K] extends Option.Option<any>
    ? K
    : K]: T[K] extends Option.Option<infer A> ? A | undefined : T[K];
} & {
  [K in keyof T as T[K] extends Option.Option<any>
    ? K
    : never]?: T[K] extends Option.Option<infer A> ? A : never;
};
type loggerConfig = NormalizeOptionObject<
  ExtractConfig<typeof loggerConfigRaw>
>;
// export const loggerConfigSchema = Schema.Struct({
//   logLevel: Schema.Literals(['error', 'warn', 'info', 'debug']),
//   fixedLogFilename: BooleanFromString.pipe(
//     Schema.withDecodingDefault(() => 'false'),
//   ),
//   logPath: Schema.String.pipe(
//     Schema.withDecodingDefault(() => platform.tmpdir()),
//   ),
//   logFilename: Schema.optional(Schema.String),
// });

// export type loggerConfig = typeof loggerConfigSchema.Type;

// export const loggerConfigSchema = z.object({
//   logLevel: z
//     .enum(['error', 'warn', 'info', 'debug'])
//     .optional()
//     .default('info'),
//   fixedLogFilename: z
//     .string()
//     .optional()
//     .transform((v) => v === 'true')
//     .default(false),
//   logPath: z.string().optional().default(platform.tmpdir()),
//   logFilename: z.string().optional(),
// });
//export type LoggerConfig = z.infer<typeof loggerConfigSchema>;

// export const loggerEnvMap = {
//   logLevel: 'LOGGER_LEVEL',
//   fixedLogFilename: 'FIXED_LOGFILENAME',
//   logPath: 'LOGPATH',
//   logFilename: 'LOGFILENAME',
// };
// type LoggerConfig = {
//   logLevel: string;
//   fixedLogFilename: boolean;
//   logPath: string;
//   logFilename?: string;
// };
export const initLoggerFromEnv = async () => {
  const program = Effect.gen(function* () {
    const configService = yield* ConfigService;
    const loadedData = yield* configService.load(loggerConfigRaw).pipe(
      Effect.map((data) => {
        return {
          logLevel: data.logLevel,
          fixedLogFilename: data.fixedLogFilename,
          logPath: data.logPath,
          logFilename: Option.getOrUndefined(data.logFilename),
        };
      }),
    );
    // const config: loggerConfig = {
    //   logLevel: (process.env.LOGGER_LEVEL ?? 'info') as any,
    //   fixedLogFilename: !process.env.FIXED_LOGFILENAME
    //     ? false
    //     : process.env.FIXED_LOGFILENAME == 'true'
    //       ? true
    //       : false,
    //   logPath: process.env.LOGPATH ?? platform.tmpdir(),
    //   logFilename: process.env.LOGFILENAME,
    // };
    initLogger(loadedData);
  });
  const loggerConfigLayer = Layer.mergeAll(ConfigLayer).pipe(
    Layer.provideMerge(PlatformLayer),
  );
  const runner = makeRunner(loggerConfigLayer);
  await runner(program);
};

export const initLogger = (config: loggerConfig) => {
  const loggerLevel = config.logLevel;
  const LogFileNameStatic = config.fixedLogFilename;
  const LogFileDirectory = config.logPath;
  LogFileName = !config.logFilename
    ? undefined
    : LogFileDirectory +
      platform.sep +
      (config.logFilename +
        (LogFileNameStatic
          ? ''
          : '.' + format(new Date(), 'yyyyMMddHHmmss') + '.log'));
  console.log(
    `Logger initialized with level ${loggerLevel}, log file: ${LogFileName}`,
  );

  const targets: any[] = [
    {
      target: 'pino/file',
      level: loggerLevel,
      options: { destination: 1 }, // 1=stdout
    },
  ];

  if (LogFileName) {
    targets.push({
      target: 'pino/file',
      level: loggerLevel,
      options: { destination: LogFileName, mkdir: true },
    });
  }
  transport = pino.transport({ targets: targets });

  loggerInstance = new InternalLogger(
    pino(
      {
        level: loggerLevel,
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      transport,
    ),
  );
};
const getLogger = () => {
  if (!loggerInstance) {
    // const loggerLevel = process.env.LOGGER_LEVEL ?? 'info';
    // const LogFileNameStatic =

    throw new Error(
      'Logger called WITHOUT initialized. Please call initLoggerFromEnv or initLogger ',
    );
  }
  return loggerInstance!;
};

export const logger = {
  info: (message: any, ...args: any[]) => getLogger().info(message, ...args),
  debug: (message: any, ...args: any[]) => getLogger().debug(message, ...args),
  error: (message: any, ...args: any[]) => getLogger().error(message, ...args),
  warn: (message: any, ...args: any[]) => getLogger().warn(message, ...args),
  isDebugEnabled: () => getLogger().isDebugEnabled(),

  end: () => getLogger().end(),
};

export const logDifferenceWhenDebugMode = (
  objectKey: string,
  objA: object,
  objB: object,
) => {
  if (logger.isDebugEnabled()) {
    const result = reconcile(objA, objB);
    if (result.length == 0) {
      logger.debug(`Object ${objectKey} has no diff , but it's to be updated`);
      logger.debug('Source', objA);
      logger.debug('Destination', objB);
      return;
    }
    logger.debug(`Object ${objectKey} has difference`, result);
  }
};

//logger.info('test');
export const effectLogger = Logger.make(({ logLevel, message }) => {
  switch (logLevel) {
    case 'Debug':
      logger.debug(message);
      break;
    case 'Info':
      logger.info(message);
      break;
    case 'Warn':
      logger.warn(message);
      break;
    case 'Error':
      logger.error(message);
      break;
  }
});

export const __resetLoggerForTest = () => {
  loggerInstance = null;
  transport = undefined;
};
