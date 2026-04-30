import { Logger } from 'effect';
import { reconcile } from '../../shared/index.js';

type LogMeta = Record<string, unknown> | object;
interface LeveledLogMethod {
  (message: string): void;
  (meta: LogMeta, message: string, ...args: any[]): void;
}
export interface Logger {
  error: LeveledLogMethod;
  warn: LeveledLogMethod;
  debug: LeveledLogMethod;
  info: LeveledLogMethod;
  isDebugEnabled(): boolean;

  end(): Promise<void>;
}

let currentLogger: Logger = {
  error: () => {},
  warn: () => {},
  debug: () => {
    console.log('something wrong');
  },
  info: () => {},
  isDebugEnabled: () => false,
  end: async () => {},
};
// 👇 差し替えポイント
export const setLogger = (logger: Logger) => {
  currentLogger = logger;
};

const wrap = (level: 'info' | 'debug' | 'warn' | 'error'): LeveledLogMethod => {
  function fn(message: string): void;
  function fn(meta: LogMeta, message: string, ...args: any[]): void;
  function fn(arg1: string | LogMeta, arg2?: string, ...args: any[]) {
    const l = currentLogger;

    if (typeof arg1 === 'string') {
      return l[level](arg1);
    }
    return l[level](arg1, arg2!, ...args);
  }

  return fn;
};
// 👇 既存コードはこれを使う

export const logger: Logger = {
  error: wrap('error'),
  warn: wrap('warn'),
  debug: wrap('debug'),
  info: wrap('info'),
  isDebugEnabled: () => currentLogger.isDebugEnabled(),
  end: () => currentLogger.end(),
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
