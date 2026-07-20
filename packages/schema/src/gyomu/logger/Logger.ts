import { Logger } from 'effect'
import { reconcile } from '../../shared/index.js'

type LogMeta = Record<string, unknown> | object
interface LeveledLogMethod {
  (message: string): void
  (meta: LogMeta, message: string, ...args: Array<any>): void
}

/**
 * Defines a generic interface for logging application events, supporting multiple log levels and lifecycle management.
 */
export interface Logger {
  /**
   * Logs an error message.
   */
  error: LeveledLogMethod

  /**
   * Logs a warning message.
   */
  warn: LeveledLogMethod

  /**
   * Logs a debug message.
   */
  debug: LeveledLogMethod

  /**
   * Logs an informational message.
   */
  info: LeveledLogMethod

  /**
   * Checks whether debug-level logging is currently enabled.
   *
   * @returns True if debug logs are enabled, otherwise false.
   */
  isDebugEnabled: () => boolean

  /**
   * Flushes or closes the logger, releasing associated resources.
   *
   * @returns A promise that resolves when the logger has successfully shut down.
   */
  end: () => Promise<void>
}

let currentLogger: Logger = {
  error: () => {},
  warn: () => {},
  debug: () => {
    console.log('something wrong')
  },
  info: () => {},
  isDebugEnabled: () => false,
  end: async () => {},
}

const wrapConsole =
  (level: 'info' | 'debug' | 'warn' | 'error') =>
  (arg1: any, arg2?: any, ...args: Array<any>) => {
    if (typeof arg1 === 'string') {
      return console[level](arg1)
    }
    return console[level](arg1, arg2, ...args)
  }
const consoleLogger: Logger = {
  error: wrapConsole('error'),
  warn: wrapConsole('warn'),
  debug: wrapConsole('debug'),
  info: wrapConsole('info'),
  isDebugEnabled: () => false,
  end: async () => {},
}
currentLogger = consoleLogger
// 👇 差し替えポイント

/**
 * Sets the active logger instance used by the system.
 *
 * @param logger The logger instance to set.
 */
export const setLogger = (logger: Logger) => {
  currentLogger = logger
}

const wrap = (level: 'info' | 'debug' | 'warn' | 'error'): LeveledLogMethod => {
  function fn(message: string): void
  function fn(meta: LogMeta, message: string, ...args: Array<any>): void
  function fn(arg1: string | LogMeta, arg2?: string, ...args: Array<any>) {
    const l = currentLogger

    if (typeof arg1 === 'string') {
      return l[level](arg1)
    }
    return l[level](arg1, arg2!, ...args)
  }

  return fn
}
// 👇 既存コードはこれを使う

/**
 * The default logger proxy instance.
 */
export const logger: Logger = {
  error: wrap('error'),
  warn: wrap('warn'),
  debug: wrap('debug'),
  info: wrap('info'),
  isDebugEnabled: () => currentLogger.isDebugEnabled(),
  end: () => currentLogger.end(),
}

/**
 * Logs the differences between two objects when debug logging is active.
 *
 * @param objectKey The identifier for the object comparison context.
 *
 * @param objA The source object.
 *
 * @param objB The destination object.
 */
export const logDifferenceWhenDebugMode = (objectKey: string, objA: object, objB: object) => {
  if (logger.isDebugEnabled()) {
    const result = reconcile(objA, objB)
    if (result.length == 0) {
      logger.debug(`Object ${objectKey} has no diff , but it's to be updated`)
      logger.debug(objA, 'Source')
      logger.debug(objB, 'Destination')
      return
    }
    logger.debug(result, `Object ${objectKey} has difference`)
  }
}
// logger.info('test');

/**
 * An instance of Logger configured for logging Effect-related events.
 */
export const effectLogger = Logger.make(({ logLevel, message }) => {
  if (typeof message === 'object' && message !== null) {
    logWithLevel(logLevel, message, 'effect log')
  } else {
    logWithLevel(logLevel, {}, String(message))
  }
})
function logWithLevel(level: string, meta: object, msg: string) {
  switch (level) {
    case 'Debug':
      logger.debug(meta, msg)
      break
    case 'Info':
      logger.info(meta, msg)
      break
    case 'Warn':
      logger.warn(meta, msg)
      break
    case 'Error':
      logger.error(meta, msg)
      break
  }
}
