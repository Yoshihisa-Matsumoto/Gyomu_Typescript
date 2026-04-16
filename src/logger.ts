import { platform } from './infrastructure/fs/index.js';
import winston from 'winston';
import { reconcile } from './shared/object/diff.js';
//import dotenv from 'dotenv';
//import { z } from './zod.js';
//import { EnvConfigSource, loadConfig } from './configurator.js';
import { format } from 'date-fns';
//dotenv.config();
interface LeveledLogMethod {
  (message: any, ...meta: any[]): void;
}
interface Logger {
  error: LeveledLogMethod;
  warn: LeveledLogMethod;
  debug: LeveledLogMethod;
  info: LeveledLogMethod;
  isDebugEnabled(): boolean;
  on(event: string, listener: (...args: any[]) => void): void;
  format(): winston.Logform.Format;
  transports(): winston.transport[]; // Updated this line
  end(): winston.Logger;
}
class InternalLogger implements Logger {
  constructor(private readonly logger: winston.Logger) {}
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
    return this.logger.isDebugEnabled();
  }
  on(event: string, listener: (...args: any[]) => void) {
    this.logger.on(event, listener);
  }
  format(): winston.Logform.Format {
    return this.logger.format;
  }
  transports(): winston.transport[] {
    return this.logger.transports;
  }
  end(cb?: (() => void) | undefined): winston.Logger {
    return this.logger.end(cb);
  }
}
// const loggerLevel = process.env.LOGGER_LEVEL ?? 'info';
// const LogFileNameStatic =
//   (process.env.FIXED_LOGFILENAME ?? 'false').toUpperCase() === 'TRUE';
// const LogFileDirectory = process.env.LOGPATH ?? platform.tmpdir();
export let LogFileName: string | undefined = undefined;
let loggerInstance: InternalLogger | null = null;

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
type LoggerConfig = {
  logLevel: string;
  fixedLogFilename: boolean;
  logPath: string;
  logFilename?: string;
};
export const initLoggerFromEnv = () => {
  // const config = loadConfig(
  //   new EnvConfigSource(),
  //   loggerConfigSchema,
  //   loggerEnvMap,
  // );
  const config: LoggerConfig = {
    logLevel: process.env.LOGGER_LEVEL ?? 'info',
    fixedLogFilename: !process.env.FIXED_LOGFILENAME
      ? false
      : process.env.FIXED_LOGFILENAME == 'true'
        ? true
        : false,
    logPath: process.env.LOGPATH ?? platform.tmpdir(),
    logFilename: process.env.LOGFILENAME,
  };
  initLogger(config);
};

export const initLogger = (config: LoggerConfig) => {
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

  loggerInstance = new InternalLogger(
    winston.createLogger({
      level: loggerLevel,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
      ),
      transports: !LogFileName
        ? [new winston.transports.Console()]
        : [
            new winston.transports.Console(),
            new winston.transports.File({ filename: LogFileName }),
          ],
    }),
  );
};
const getLogger = () => {
  if (!loggerInstance) {
    const loggerLevel = process.env.LOGGER_LEVEL ?? 'info';
    const LogFileNameStatic =
      (process.env.FIXED_LOGFILENAME ?? 'false').toUpperCase() === 'TRUE';
    const LogFileDirectory = process.env.LOGPATH ?? platform.tmpdir();
    const LogFileName = !process.env.LOGFILENAME
      ? undefined
      : LogFileDirectory +
        platform.sep +
        (process.env.LOGFILENAME +
          (LogFileNameStatic
            ? ''
            : '.' + format(new Date(), 'yyyyMMddHHmmss') + '.log'));
    console.log(`Level: ${loggerLevel}, File: ${LogFileName}`);
    loggerInstance = new InternalLogger(
      winston.createLogger({
        level: loggerLevel,
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.json(),
        ),
        transports: !LogFileName
          ? [new winston.transports.Console()]
          : [
              new winston.transports.Console(),
              new winston.transports.File({ filename: LogFileName }),
            ],
      }),
    );
  }
  return loggerInstance;
};

export const logger = {
  info: (message: any, ...args: any[]) => getLogger().info(message, ...args),
  debug: (message: any, ...args: any[]) => getLogger().debug(message, ...args),
  error: (message: any, ...args: any[]) => getLogger().error(message, ...args),
  warn: (message: any, ...args: any[]) => getLogger().warn(message, ...args),
  isDebugEnabled: () => getLogger().isDebugEnabled(),
  on: (event: string, listener: (...args: any[]) => void) =>
    getLogger().on(event, listener),
  format: getLogger().format(),
  transports: getLogger().transports(),
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
