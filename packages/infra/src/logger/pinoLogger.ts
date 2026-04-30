import path from 'path';

import pino from 'pino';
import { Logger, setLogger } from '@gyomu/core';
import { reconcile } from '@gyomu/core/shared';
import { format } from 'date-fns';
import {
  Config,
  Logger as EffectLogger,
  Schema,
  Option,
  Effect,
  Layer,
} from 'effect';
import { ConfigLayer, ConfigService } from '../config.js';
import { makeRunner } from '../runtime.js';
import { PlatformLayer } from '../layer.js';
import { tmpdir } from 'os';

export const createPinoLogger = (): Logger => {
  const p = pino();

  const wrap =
    (level: 'info' | 'debug' | 'warn' | 'error') =>
    (arg1: any, arg2?: any, ...args: any[]) => {
      if (typeof arg1 === 'string') {
        return p[level](arg1);
      }
      return p[level](arg1, arg2, ...args);
    };

  return {
    info: wrap('info'),
    debug: wrap('debug'),
    warn: wrap('warn'),
    error: wrap('error'),
    isDebugEnabled: () => p.level === 'debug',
    end: async () => {},
  };
};
let transport: ReturnType<typeof pino.transport> | undefined = undefined;
export let LogFileName: string | undefined = undefined;

const loggerConfigRaw = Config.all({
  logLevel: Config.withDefault(Config.string(`LOGGER_LEVEL`), 'info'),
  fixedLogFilename: Config.withDefault(
    Config.boolean(`FIXED_LOGFILENAME`),
    false,
  ),
  logPath: Config.withDefault(Config.string(`LOGPATH`), tmpdir()),
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
      path.sep +
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
  console.log(targets);
  transport = pino.transport({ targets: targets });

  const p = pino(
    {
      level: loggerLevel,
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    transport,
  );

  const wrap =
    (level: 'info' | 'debug' | 'warn' | 'error') =>
    (arg1: any, arg2?: any, ...args: any[]) => {
      if (typeof arg1 === 'string') {
        return p[level](arg1);
      }
      return p[level](arg1, arg2, ...args);
    };

  setLogger({
    info: wrap('info'),
    debug: wrap('debug'),
    warn: wrap('warn'),
    error: wrap('error'),
    isDebugEnabled: () => p.level === 'debug',
    end: async () => {
      if (transport) {
        await new Promise((resolve) => {
          transport?.end();
          transport?.on('close', resolve);
        });
      }
    },
  });
};

export const __resetLoggerForTest = () => {
  // loggerInstance = null;
  setLogger({
    error: () => {},
    warn: () => {},
    debug: () => {},
    info: () => {},
    isDebugEnabled: () => false,
    end: async () => {},
  });
  transport = undefined;
};
