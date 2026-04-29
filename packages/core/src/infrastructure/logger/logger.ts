import { platform } from '../fs/index.js';

import pino from 'pino';
import type { Logger as PinoLogger } from 'pino';
import { reconcile } from '../../shared/object/diff.js';
import { format } from 'date-fns';
import { Config, Logger, Schema, Option, Effect, Layer } from 'effect';
import { ConfigLayer, ConfigService } from '../config.js';
import { makeRunner } from '../runtime.js';
import { PlatformLayer } from '../layer.js';
type LogMeta = Record<string, unknown> | object;
interface LeveledLogMethod {
  (message: string): void;
  (meta: LogMeta, message: string, ...args: any[]): void;
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

  private log(
    level: 'info' | 'debug' | 'warn' | 'error',
    arg1: string | LogMeta,
    arg2?: string,
    ...args: any[]
  ) {
    if (typeof arg1 === 'string') {
      return this.logger[level](arg1);
    }
    return this.logger[level](arg1, arg2!, ...args);
  }

  info(message: string): void;
  info(meta: LogMeta, message: string, ...args: any[]): void;
  info(arg1: string | LogMeta, arg2?: string, ...args: any[]) {
    return this.log('info', arg1, arg2, ...args);
  }

  debug(message: string): void;
  debug(meta: LogMeta, message: string, ...args: any[]): void;
  debug(arg1: string | LogMeta, arg2?: string, ...args: any[]) {
    return this.log('debug', arg1, arg2, ...args);
  }

  error(message: string): void;
  error(meta: LogMeta, message: string, ...args: any[]): void;
  error(arg1: string | LogMeta, arg2?: string, ...args: any[]) {
    return this.log('error', arg1, arg2, ...args);
  }

  warn(message: string): void;
  warn(meta: LogMeta, message: string, ...args: any[]): void;
  warn(arg1: string | LogMeta, arg2?: string, ...args: any[]) {
    return this.log('warn', arg1, arg2, ...args);
  }
  isDebugEnabled() {
    return this.logger.level === 'debug';
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

function isMeta(arg: unknown): arg is LogMeta {
  return typeof arg === 'object' && arg !== null && !Array.isArray(arg);
}
const wrap =
  (level: 'info' | 'debug' | 'error' | 'warn') =>
  (arg1: string | LogMeta, arg2?: string, ...args: any[]) => {
    const l = getLogger();
    if (typeof arg1 === 'string') {
      return l[level](arg1);
    }
    return l[level](arg1, arg2!, ...args);
  };

export const logger: Logger = {
  info: wrap('info'),
  debug: wrap('debug'),
  error: wrap('error'),
  warn: wrap('warn'),
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
      logger.debug(objA, 'Source');
      logger.debug(objB, 'Destination');
      return;
    }
    logger.debug(result, `Object ${objectKey} has difference`);
  }
};

//logger.info('test');
export const effectLogger = Logger.make(({ logLevel, message }) => {
  if (typeof message === 'object' && message !== null) {
    logWithLevel(logLevel, message, 'effect log');
  } else {
    logWithLevel(logLevel, {}, String(message));
  }
});

function logWithLevel(level: string, meta: object, msg: string) {
  switch (level) {
    case 'Debug':
      logger.debug(meta, msg);
      break;
    case 'Info':
      logger.info(meta, msg);
      break;
    case 'Warn':
      logger.warn(meta, msg);
      break;
    case 'Error':
      logger.error(meta, msg);
      break;
  }
}

export const __resetLoggerForTest = () => {
  loggerInstance = null;
  transport = undefined;
};
