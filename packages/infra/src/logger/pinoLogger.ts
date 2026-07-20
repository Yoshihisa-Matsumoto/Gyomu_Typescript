import path from 'node:path'

import { tmpdir } from 'node:os'
import pino from 'pino'
import { setLogger, withOptional } from '@gyomu/schema'
import { format } from 'date-fns'
import { Config, Effect, Layer, Option } from 'effect'
import { makeRunner } from '@gyomu/schema/effect'
import { ConfigLayer, ConfigService } from '../config.js'
import { PlatformLayer } from '../layer.js'
import type { Logger } from '@gyomu/schema'

export const normalizeLogValue = (value: unknown, index: number = 0): unknown => {
  index++
  if (index > 5) return '(limit)'

  if (value instanceof Map) {
    return Object.fromEntries(
      [...value.entries()].map(([k, v]) => [String(k), normalizeLogValue(v)]),
    )
  }

  if (value instanceof Set) {
    return [...value].map(normalizeLogValue)
  }

  if (Array.isArray(value)) {
    return value.map(normalizeLogValue)
  }

  if (
    value !== null &&
    typeof value === 'object' &&
    !(value instanceof Date) &&
    !(value instanceof Error)
  ) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, normalizeLogValue(v, index)]),
    )
  }

  return value
}

export const createPinoLogger = (): Logger => {
  const p = pino()

  const wrap =
    (level: 'info' | 'debug' | 'warn' | 'error') =>
    (arg1: any, arg2?: any, ...args: Array<any>) => {
      if (typeof arg1 === 'string') {
        return p[level](arg1)
      }
      return p[level](normalizeLogValue(arg1), arg2, ...args.map(normalizeLogValue))
    }

  return {
    info: wrap('info'),
    debug: wrap('debug'),
    warn: wrap('warn'),
    error: wrap('error'),
    isDebugEnabled: () => p.level === 'debug',
    end: async () => {},
  }
}
let transport: ReturnType<typeof pino.transport> | undefined = undefined
export let LogFileName: string | undefined = undefined

const loggerConfigRaw = Config.all({
  logLevel: Config.withDefault(Config.string(`LOGGER_LEVEL`), 'info'),
  fixedLogFilename: Config.withDefault(Config.boolean(`FIXED_LOGFILENAME`), false),
  logPath: Config.withDefault(Config.string(`LOGPATH`), tmpdir()),
  logFilename: Config.option(Config.string('LOGFILENAME')),
})
type ExtractConfig<T> = T extends Config.Config<infer A> ? A : never
// type UnwrapOption<T> = T extends Option.Option<infer A> ? A | undefined : T;

type NormalizeOptionObject<T> = {
  [K in keyof T as T[K] extends Option.Option<any> ? K : never]?: T[K] extends Option.Option<
    infer A
  >
    ? A
    : never
} & {
  [K in keyof T as T[K] extends Option.Option<any> ? never : K]: T[K]
}
type loggerConfig = NormalizeOptionObject<ExtractConfig<typeof loggerConfigRaw>>

export const initLoggerFromEnv = async () => {
  const program = Effect.gen(function* () {
    const configService = yield* ConfigService
    const loadedData = yield* configService.load(loggerConfigRaw).pipe(
      Effect.map((data) =>
        withOptional({
          logLevel: data.logLevel,
          fixedLogFilename: data.fixedLogFilename,
          logPath: data.logPath,
          logFilename: Option.getOrUndefined(data.logFilename),
        }),
      ),
    )

    initLogger(loadedData)
  })
  const loggerConfigLayer = Layer.mergeAll(ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
  const runner = makeRunner(loggerConfigLayer)
  await runner(program)
}

export const initLogger = (config: loggerConfig) => {
  const loggerLevel = config.logLevel
  const LogFileNameStatic = config.fixedLogFilename
  const LogFileDirectory = config.logPath
  LogFileName = !config.logFilename
    ? undefined
    : LogFileDirectory +
      path.sep +
      (config.logFilename +
        (LogFileNameStatic ? '' : '.' + format(new Date(), 'yyyyMMddHHmmss') + '.log'))
  console.log(`Logger initialized with level ${loggerLevel}, log file: ${LogFileName}`)

  const targets: Array<any> = [
    {
      target: 'pino/file',
      level: loggerLevel,
      options: { destination: 1 }, // 1=stdout
    },
  ]

  if (LogFileName) {
    targets.push({
      target: 'pino/file',
      level: loggerLevel,
      options: { destination: LogFileName, mkdir: true },
    })
  }
  // console.log(targets);
  transport = pino.transport({ targets: targets })

  const p = pino(
    {
      level: loggerLevel,
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    transport,
  )

  const wrap =
    (level: 'info' | 'debug' | 'warn' | 'error') =>
    (arg1: any, arg2?: any, ...args: Array<any>) => {
      if (typeof arg1 === 'string') {
        return p[level](arg1)
      }
      return p[level](normalizeLogValue(arg1), arg2, ...args.map(normalizeLogValue))
    }

  setLogger({
    info: wrap('info'),
    debug: wrap('debug'),
    warn: wrap('warn'),
    error: wrap('error'),
    isDebugEnabled: () => p.level === 'debug',
    end: async () => {
      if (transport) {
        await new Promise((resolve) => {
          transport?.end()
          transport?.on('close', resolve)
        })
      }
    },
  })
}

export const __resetLoggerForTest = () => {
  // loggerInstance = null;
  setLogger({
    error: () => {},
    warn: () => {},
    debug: () => {},
    info: () => {},
    isDebugEnabled: () => false,
    end: async () => {},
  })
  transport = undefined
}
